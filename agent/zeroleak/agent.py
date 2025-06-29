from langchain_google_genai import ChatGoogleGenerativeAI
import os
from typing import TypedDict, List
from langchain_core.documents import Document
from urllib.parse import urlparse
import os
from langchain_community.document_loaders import GithubFileLoader
from langchain_core.documents import Document
from langgraph.graph import StateGraph
from langgraph.checkpoint.memory import MemorySaver
import re

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv('Gemini_API_KEY'))
gemini_api_key = os.getenv('Gemini_API_KEY')
token = os.getenv('GITHUB_TOKEN')



class GraphState(TypedDict):
    """
    Represents the state of the LangGraph for the secret detection workflow.

    Attributes:
        repo_url: The URL of the GitHub repository being analyzed.
        loaded_documents: A list of Document objects representing the loaded files.
        potential_secrets: A list of dictionaries, each containing details about a potential secret found by pattern matching.
        merged_context_ranges: A dictionary where keys are file paths and values are merged context ranges (list of tuples).
        llm_analysis_results: A dictionary where keys are file paths and values are the LLM's analysis of the context.
    """
    repo_url: str
    loaded_documents: List[Document]
    potential_secrets: List[dict]
    merged_context_ranges: dict
    llm_analysis_results: dict




def create_github_file_loader(repo_url):
    """
    Creates a GithubFileLoader for the given repository URL, excluding binary files.
    """
    parsed_url = urlparse(repo_url)
    path_parts = parsed_url.path.strip('/').split('/')
    if len(path_parts) < 2:
        raise ValueError(f"Invalid GitHub repository URL: {repo_url}")
    repo_owner = path_parts[0]
    repo_name = path_parts[1]

    # Define a list of common binary file extensions to exclude
    binary_extensions = [
    # Images
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.raw', '.heic', '.webp', '.svgz', '.ico', '.dds', '.psd',
    # Videos
    '.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.mpeg', '.mpg', '.3gp', '.m4v', '.vob',
    # Audio
    '.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a', '.alac', '.opus',
    # Archives and Compressed Files
    '.zip', '.tar', '.gz', '.rar', '.7z', '.bz2', '.xz', '.lz', '.lzma', '.cab', '.iso', '.dmg', '.arj', '.z',
    # Documents (often binary)
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp', '.pages', '.key', '.numbers',
    # Databases
    '.sqlite', '.db', '.mdb', '.accdb', '.dbf', '.sql', '.ndb',
    # Executables and Libraries
    '.exe', '.dll', '.so', '.dylib', '.bin', '.app', '.deb', '.rpm', '.apk', '.bat', '.com', '.jar', '.class', '.o', '.a', '.lib', '.sys',
    # Fonts
    '.woff', '.woff2', '.ttf', '.otf', '.eot', '.fon', '.fnt',
    # Disk and System Images
    '.iso', '.img', '.vmdk', '.vdi', '.vhd', '.vhdx', '.qcow2', '.raw',
    # Miscellaneous Binary Formats
    '.torrent', '.bak', '.lock', '.dat', '.bin', '.lockb'
]

    # Assuming 'token' is a global variable containing the GitHub Personal Access Token
    if 'token' not in globals() or not globals()['token']:
         raise ValueError("GitHub Personal Access Token not found. Please ensure the 'token' variable is set.")

    return GithubFileLoader(
        repo=f"{repo_owner}/{repo_name}",
        access_token=token,
        # Use a lambda function to filter out files with binary extensions
        file_filter=lambda file_path: not any(file_path.lower().endswith(ext) for ext in binary_extensions),
    )


def load_files_node(state: GraphState) -> GraphState:
    """
    Loads files from the GitHub repository specified in the state.
    """
    print("---LOADING FILES---")
    repo_url = state['repo_url']
    loaded_documents = []

    try:
        loader = create_github_file_loader(repo_url)
        all_file_paths = loader.get_file_paths()

        for file_info in all_file_paths:
            file_path = file_info['path']
            try:
                document_content = loader.get_file_content_by_path(file_path)
                loaded_documents.append(Document(page_content=document_content, metadata={"file_path": file_path}))
            except UnicodeDecodeError:
                print(f"Skipping file due to decoding error: {file_path}")
            except Exception as e:
                print(f"An error occurred while loading {file_path}: {e}")

        print(f"Successfully loaded {len(loaded_documents)} files.")

    except ValueError as ve:
        print(f"Error creating GitHub file loader: {ve}")
        # Handle the error, perhaps by updating state to indicate failure
        # For now, we'll just pass and the loaded_documents list will be empty
        pass
    except Exception as e:
        print(f"An unexpected error occurred during file loading: {e}")
        pass


    return {**state, 'loaded_documents': loaded_documents}

def pattern_matching_node(state: GraphState) -> GraphState:
    """
    Performs pattern matching on loaded documents to find potential secrets.
    """
    print("---PERFORMING PATTERN MATCHING---")
    loaded_documents = state.get('loaded_documents', [])
    potential_secrets = []


    secret_patterns = [
        r'AKIA[0-9A-Z]{16}',  # AWS Access Key ID
        r'SKIA[0-9A-Z]{16}',  # AWS Secret Access Key
        r'AIza[0-9A-Za-z-_]{35}',  # Google API Key
        r'ya29\.[0-9A-Za-z\-_]+',  # Google OAuth Access Token
        r'ghp_[0-9a-zA-Z]{36}',  # GitHub Personal Access Token
        r'gho_[0-9a-zA-Z]{36}',  # GitHub OAuth Token
        r'ghu_[0-9a-zA-Z]{36}',  # GitHub User-to-Server Token
        r'ghs_[0-9a-zA-Z]{36}',  # GitHub Server-to-Server Token
        r'sk-([a-zA-Z0-9]{32}|[a-zA-Z0-9]{48})',  # OpenAI API Key
        r'pk-([a-zA-Z0-9]{32}|[a-zA-Z0-9]{48})',  # OpenAI Publishable Key
        r'Bearer [A-Za-z0-9\-\._~+\/]+=*',  # Generic Bearer Token
        r'password\s*=\s*[\'"]([^\'"]+)[\'"]',  # Password in assignment
        r'secret\s*=\s*[\'"]([^\'"]+)[\'"]',  # Secret in assignment
        r'api_key\s*=\s*[\'"]([^\'"]+)[\'"]',  # API Key in assignment
        r'auth_token\s*=\s*[\'"]([^\'"]+)[\'"]',  # Auth Token in assignment
        r'-----BEGIN PRIVATE KEY-----.*-----END PRIVATE KEY-----', # PEM private key
        r'ssh-rsa\s+[A-Za-z0-9+\/]+={0,2}(\s+[^\s]+)?', # SSH private key
        r'ssh-ed25519\s+[A-Za-z0-9+\/]+={0,2}(\s+[^\s]+)?', # SSH private key
        r'PGP PRIVATE KEY BLOCK', # PGP private key
        r'client_secret\s*=\s*[\'"]([^\'"]+)[\'"]', # Client secret
        r'client_id\s*=\s*[\'"]([^\'"]+)[\'"]', # Client ID (less sensitive but often paired)
        r'(\w+)?key(\w+)?', # Keyword 'key'
        r'(\w+)?secret(\w+)?', # Keyword 'secret'
        r'(\w+)?password(\w+)?', # Keyword 'password'
        r'(\w+)?token(\w+)?', # Keyword 'token'
        r'(\w+)?credential(\w+)?', # Keyword 'credential'
    ]


    for document in loaded_documents:
        for pattern in secret_patterns:
            for match in re.finditer(pattern, document.page_content):
                 potential_secrets.append({
                    "file_path": document.metadata.get('file_path', 'N/A'),
                    "pattern": pattern,
                    "match_str": match.group(0),
                    "start_index": match.start(),
                    "end_index": match.end()
                })

    print(f"Found {len(potential_secrets)} potential secret occurrences.")

    return {**state, 'potential_secrets': potential_secrets}

def merge_context_ranges_node(state: GraphState) -> GraphState:
    """
    Merges overlapping context ranges for potential secrets within each file.
    Includes the get_context_lines helper function.
    """
    print("---MERGING CONTEXT RANGES---")
    potential_secrets = state.get('potential_secrets', [])
    loaded_documents = state.get('loaded_documents', [])


    def get_context_lines(content, match_start, match_end, lines_before=3, lines_after=3):
        """
        Extracts the start and end line numbers around a matched section in a string.
        """
        lines = content.splitlines()
        start_char_index = 0
        start_line_index = -1
        end_line_index = -1

        for i, line in enumerate(lines):
            end_char_index = start_char_index + len(line) + 1

            if start_char_index <= match_start < end_char_index or \
               start_char_index <= match_end < end_char_index or \
               (match_start < start_char_index and match_end >= start_char_index):

                if start_line_index == -1:
                     start_line_index = max(0, i - lines_before)
                end_line_index = min(len(lines), i + lines_after + 1)

            start_char_index = end_char_index

        if start_line_index == -1:
            return (-1, -1)

        return (start_line_index, end_line_index)

    file_context_ranges = {}

    for finding in potential_secrets:
        file_path = finding['file_path']
        document_content = None
        for doc in loaded_documents:
            if doc.metadata.get('file_path') == file_path:
                document_content = doc.page_content
                break

        if document_content:
            start_line, end_line = get_context_lines(document_content, finding['start_index'], finding['end_index'])

            if (start_line, end_line) != (-1, -1):
                if file_path not in file_context_ranges:
                    file_context_ranges[file_path] = []
                file_context_ranges[file_path].append((start_line, end_line))

    merged_file_context_ranges = {}

    for file_path, ranges in file_context_ranges.items():
        sorted_ranges = sorted(ranges)
        merged_ranges = []
        if sorted_ranges:
            current_merged_range = list(sorted_ranges[0])

            for start, end in sorted_ranges[1:]:
                if start <= current_merged_range[1]:
                    current_merged_range[1] = max(current_merged_range[1], end)
                else:
                    merged_ranges.append(tuple(current_merged_range))
                    current_merged_range = [start, end]
            merged_ranges.append(tuple(current_merged_range))
        merged_file_context_ranges[file_path] = merged_ranges

    print("Merged context ranges calculated.")

    return {**state, 'merged_context_ranges': merged_file_context_ranges}



def analyze_with_llm_node(state: GraphState) -> GraphState:
    """
    Analyzes extracted contexts with the LLM to verify the presence of secrets.
    """
    print("---ANALYZING WITH LLM---")
    merged_context_ranges = state.get('merged_context_ranges', {})
    loaded_documents = state.get('loaded_documents', [])
    llm_analysis_results = {}

    # Ensure llm is accessible in this scope (assuming it's a global variable or passed in)
    # If not accessible, this will raise a NameError.
    if 'llm' not in globals():
         raise ValueError("LLM is not initialized. Please ensure the 'llm' variable is set.")


    for file_path, merged_ranges in merged_context_ranges.items():
        document_content = None
        for doc in loaded_documents:
            if doc.metadata.get('file_path') == file_path:
                document_content = doc.page_content
                break

        if document_content:
            lines = document_content.splitlines()
            file_context_text = ""
            for start_line, end_line in merged_ranges:
                context_text = "\n".join(lines[start_line:end_line])
                file_context_text += f"--- Context from lines {start_line+1}-{end_line} ---\n"
                file_context_text += context_text + "\n\n"

            prompt = f"""Analyze the following text extracted from a file.
            This text contains several sections from the file that were flagged as potentially containing secrets based on pattern matching.
            Review the provided context and determine if any of these sections genuinely contain secrets such as API keys, passwords, private keys, or sensitive credentials.
            For each potential genuine secret you find:
            - Specify the file path.
            - Point to the specific line numbers or provide the relevant snippet from the context.
            - Explain why you believe it is a secret.
            If you do not find any genuine secrets in the provided context, state that clearly.

            File Path: {file_path}

            Context:
            {file_context_text}
            """
            try:
                llm_response = llm.invoke(prompt)
                llm_analysis_results[file_path] = llm_response.content
            except Exception as e:
                llm_analysis_results[file_path] = f"Error during LLM analysis: {e}"
        else:
             llm_analysis_results[file_path] = "Could not retrieve content for analysis."


    print("LLM analysis complete.")

    return {**state, 'llm_analysis_results': llm_analysis_results}


# Re-compile the graph with the updated node definition
workflow = StateGraph(GraphState)

workflow.add_node("load_files", load_files_node)
workflow.add_node("pattern_matching", pattern_matching_node)
# Add the updated node definition
workflow.add_node("merge_context_ranges", merge_context_ranges_node)
workflow.add_node("analyze_with_llm", analyze_with_llm_node)

workflow.set_entry_point("load_files")
workflow.add_edge("load_files", "pattern_matching")
workflow.add_edge("pattern_matching", "merge_context_ranges")
workflow.add_edge("merge_context_ranges", "analyze_with_llm")
workflow.set_finish_point("analyze_with_llm")

graph = workflow.compile(
        checkpointer=MemorySaver(),
        interrupt_after=["analyze_with_llm"],
)