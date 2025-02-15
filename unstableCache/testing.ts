// 'use server'

export async function testing () {console.log('testing')}

const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("Done!"), 1000);
  });
try {
    await promise;
} catch (error) {
    console.error(error);
}
    