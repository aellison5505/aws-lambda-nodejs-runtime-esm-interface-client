const { run } = await import("../../../../lib/index.js");

const echo = async (event, context) => {
  console.log('hello world');
  return 'success';
};

run(echo);
