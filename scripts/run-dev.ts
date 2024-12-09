const cli = require("next/dist/cli/next-dev");

const overridePort = process.env.Z_LISTEN_PORT;

if (process.argv.length > 2 && process.argv[2] === "set_env") {
  process.env.Z_CONFIG = "../etc/testnet";
}

if (overridePort === undefined) {
  console.log("running on default nextjs port");
  cli.nextDev({
    _: [null],
  });
} else {
  console.log("overridePort", overridePort);
  cli.nextDev({
    _: [null],
    "port": Number.parseInt(overridePort),
  });
}
