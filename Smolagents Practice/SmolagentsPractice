from smolagents import CodeAgent, DuckDuckGoSearchTool, InferenceClientModel

# Connect to an AI model hosted online.
model = InferenceClientModel()

# Create an agent that can search the web.
agent = CodeAgent(
    tools=[DuckDuckGoSearchTool()],
    model=model,
)

# Give the agent a task.
result = agent.run(
    "Search for the best music recommendations for a party at Wayne's mansion."
)

print(result)