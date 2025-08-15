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
    ],
  },
];
