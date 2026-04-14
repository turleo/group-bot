export async function convertFileToOpus(input: string): Promise<Uint8Array> {
  const proc = Bun.spawn(["ffmpeg",
    "-i", input,
    "-vn",
    "-f", "ogg", "-c:a", "libopus",
    "-",
  ], {
    stderr: "inherit",
    stdout: "pipe",
  });
  const output = await Bun.readableStreamToArrayBuffer(proc.stdout);
  return new Uint8Array(output);
}
