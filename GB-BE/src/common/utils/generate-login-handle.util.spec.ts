import { buildLoginHandleBase } from './generate-login-handle.util';

describe('buildLoginHandleBase', () => {
  it('takes the first 2 letters of each name, lowercased', () => {
    expect(buildLoginHandleBase('Juan', 'Perez')).toBe('jupe');
  });

  it('strips accents/diacritics before slicing', () => {
    expect(buildLoginHandleBase('Andrés', 'Núñez')).toBe('annu');
  });

  it('strips symbols and spaces, keeping only letters', () => {
    expect(buildLoginHandleBase("O'Brien", 'Von Braun')).toBe('obvo');
  });

  it('pads a short first name with x', () => {
    expect(buildLoginHandleBase('Al', 'Rodriguez')).toBe('alro');
    expect(buildLoginHandleBase('J', 'Rodriguez')).toBe('jxro');
  });

  it('pads a short/empty last name with x', () => {
    expect(buildLoginHandleBase('Juan', '')).toBe('juxx');
  });

  it('falls back to "us" when both names sanitize to nothing', () => {
    expect(buildLoginHandleBase('123', '456')).toBe('us');
    expect(buildLoginHandleBase('', '')).toBe('us');
  });
});
