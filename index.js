const strings = ['1 a', '1 b', '2 b', '3 b', '2 a', '3 a', '4 b', '4 a', '5 a', '5 b'];

console.log(strings.sort((a, b) => Number(b.endsWith('a')) - Number(a.endsWith('a'))));
