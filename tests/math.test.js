const { calculateTip, fahrenheitToCelsius, celsiusToFahrenheit, add } = require('../math')

test('Should calculate total with tip', () => {
  const total = calculateTip(10, .3)
  expect(total).toBe(13)
})

test('Should calculate total with default tip', () => {
  const total = calculateTip(10)
  expect(total).toBe(12)
})

test('Should convert 32 F to 0 C', () => {
  const tempC = fahrenheitToCelsius(32)
  expect(tempC).toBe(0)
})

test('Should convert 0 C to 32 F', () => {
  const tempF = celsiusToFahrenheit(0)
  expect(tempF).toBe(32)
})

// test('Async test demo', (next) => {
//   setTimeout(() => {
//     expect(1).toBe(2)
//     next()
//   }, 2000);
// })

test('Should add two numbers', (next) => {
  add(2, 3).then((sum) => {
    expect(sum).toBe(5)
    next()
  })
})

test('Should add 2 nums async/await', async () => {
  const sum = await add(20, 30)
  expect(sum).toBe(50)
})
