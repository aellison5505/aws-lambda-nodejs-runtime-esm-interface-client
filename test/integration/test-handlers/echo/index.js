export const handler = async (event, context) => {
    console.log(`hello world ${event.body.name}`);
    return 'success'
};
