export default function handler(request: Request) {
  return new Response(JSON.stringify({ message: "hello world" }), {
    headers: { "content-type": "application/json" },
  });
}