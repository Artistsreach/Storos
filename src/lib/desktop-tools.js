export const tools = [
  {
    functionDeclarations: [
      {
        name: "automateTask",
        description: "Automate a task on the desktop interface.",
        parameters: {
          type: "object",
          properties: {
            task: {
              type: "string",
              description: "The task to automate.",
            },
          },
          required: ["task"],
        },
      },
      {
        name: "createStore",
        description: "Create a new store on the desktop interface.",
        parameters: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "The description of the store to create.",
            },
          },
          required: ["description"],
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
    ],
  },
];
