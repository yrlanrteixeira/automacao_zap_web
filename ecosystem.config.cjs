module.exports = {
  apps: [
    {
      name: "WppZig-Back", // The name of your application
      script: "node", // The command to start your app
      args: "build/server.js", // Arguments to pass to the command
      autorestart: true,
    },
  ],
};
