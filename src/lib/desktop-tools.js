export const tools = [
  {
    functionDeclarations: [
      {
        name: "createStore",
        description: "Create a new store on the desktop interface.",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the store to create.",
            },
            description: {
              type: "string",
              description: "The description of the store to create (what it sells, vibe, audience).",
            },
            storeType: {
              type: "string",
              description: "The type of store to create. One of: print_on_demand, dropship, fund.",
              enum: ["print_on_demand", "dropship", "fund"],
            },
          },
          required: ["name", "description", "storeType"],
        },
      },
      {
        name: "buildApp",
        description: "Build a new app on the desktop interface.",
        parameters: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "The description of the app to build.",
            },
          },
          required: ["description"],
        },
      },
      {
        name: "createVideo",
        description: "Create a new video on the desktop interface.",
        parameters: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "The description of the video to create.",
            },
          },
          required: ["description"],
        },
      },
      {
        name: "createNFT",
        description: "Create a new NFT on the desktop interface.",
        parameters: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "The description of the NFT to create.",
            },
          },
          required: ["description"],
        },
      },
      {
        name: "createPodcast",
        description: "Create a new podcast on the desktop interface.",
        parameters: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "The description of the podcast to create.",
            },
          },
          required: ["description"],
        },
      },
      {
        name: "toggleTheme",
        description: "Toggle the theme of the desktop interface.",
        parameters: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "deepResearch",
        description: "Perform a deep research task on a given topic.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The topic to research.",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "generateImage",
        description: "Generate an image based on a prompt.",
        parameters: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The prompt to generate the image from.",
            },
          },
          required: ["prompt"],
        },
      },
      {
        name: "openNotepad",
        description: "Open a notepad window and generate content for it.",
        parameters: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The prompt to generate the content from.",
            },
          },
          required: ["prompt"],
        },
      },
      {
        name: "createTable",
        description: "Create a table with the given data.",
        parameters: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The prompt to generate the table from.",
            },
          },
          required: ["prompt"],
        },
      },
      {
        name: "automateTask",
        description: "Automate a task by dispatching a tool call to the desktop interface.",
        parameters: {
          type: "object",
          properties: {
            tool_call: {
              type: "object",
              description: "The tool call to dispatch. Should be an object with 'name' and 'args' properties.",
              properties: {
                name: {
                  type: "string",
                  description: "The name of the tool to call.",
                },
                args: {
                  type: "object",
                  description: "The arguments to pass to the tool.",
                },
              },
              required: ["name", "args"],
            },
          },
          required: ["tool_call"],
        },
      },
      {
        name: "openCalculator",
        description: "Open the calculator.",
        parameters: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "createContract",
        description: "Create a new contract on the desktop interface.",
        parameters: {
          type: "object",
          properties: {
            companyName: {
              type: "string",
              description: "The name of the company.",
            },
            clientName: {
              type: "string",
              description: "The name of the client.",
            },
            services: {
              type: "string",
              description: "The services provided.",
            },
            cost: {
              type: "number",
              description: "The cost of the services.",
            },
            details: {
              type: "string",
              description: "The details of the agreement.",
            },
          },
          required: ["companyName", "clientName", "services", "cost", "details"],
        },
      },
    ],
  },
];
