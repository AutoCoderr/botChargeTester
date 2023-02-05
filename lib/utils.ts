export const rand = (a: number,b: number) => a+Math.floor(Math.random()*(b-a))

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))