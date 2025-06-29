"""Server"""

import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
import uvicorn
from copilotkit.integrations.fastapi import add_fastapi_endpoint
# from copilotkit import CopilotKitSDK, LangGraphAgent
from zeroleak.agent import graph
from copilotkit import CopilotKitRemoteEndpoint, LangGraphAgent

app = FastAPI()
# sdk = CopilotKitSDK(
#     agents=[
#         LangGraphAgent(
#             name="zeroleak-agent",
#             description="Find api keys and vulnerable secrets in github code",
#             agent=graph,
#         )
#     ],
# )
sdk = CopilotKitRemoteEndpoint(
    agents=[
        LangGraphAgent(
            name="zeroleak-agent",
            graph=graph,
            description="Find api keys and vulnerable secrets in github code",
        ),
        # LangGraphAgent(name="zeroleak-agent", graph=graph, description="Find api keys and vulnerable secrets in github code"),
    ]
)

# Add the CopilotKit FastAPI endpoint
add_fastapi_endpoint(app, sdk, "/copilotkit")
# add_fastapi_endpoint(app, sdk, "/copilotkit")



def main():
    """Run the uvicorn server."""
    PORT = int(os.getenv("PORT", "8000"))
    APP_ENV = os.getenv("APP_ENV")
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=(APP_ENV == "development"))