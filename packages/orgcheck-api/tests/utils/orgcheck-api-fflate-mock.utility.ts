const fflate: any = jest.mock('fflate');

fflate.zlibSync = jest.fn(function (input, _options) {
  return input;
});

fflate.unzlibSync = jest.fn(function (input, _options) {
  return input;
});

export default fflate;