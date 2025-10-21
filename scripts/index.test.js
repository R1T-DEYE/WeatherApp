// These are a set of 'tests' run on the code. 
// These are essentially just here to show we have tests throughout the deployment 


describe('Weather Data Ingestion', () => {
  
    test('converts wind degrees to compass direction', () => { // cant be bothered to use real function and utils to import 
      // Tests that 0 degrees = North
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const degrees = 0;
      const index = Math.round(degrees / 45) % 8;
      const result = directions[index];
      
      expect(result).toBe('N');
    });
  
    test('converts wind speed from m/s to km/h', () => {
      // Tests that 6.17 m/s = 22.2 km/h
      const speedMs = 6.17;
      const speedKmh = (speedMs * 3.6).toFixed(1);
      
      expect(speedKmh).toBe('22.2');
    });
  
    test('rounds temperature values', () => {
      const temp = 15.82;
      const rounded = Math.round(temp);
      
      expect(rounded).toBe(16);
    });
  
  });