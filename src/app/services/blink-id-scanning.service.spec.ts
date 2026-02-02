import { BlinkIdScanningService } from './blink-id-scanning.service';

describe('BlinkIdScanningService.extractResult (private)', () => {
  it('extracts front and back data and images correctly', () => {
    const raw: any = {
      frontVizResult: {
        fullName: { description: 'John Doe' },
        dateOfBirth: { originalDateStringResult: { description: '01.01.1990' } },
        documentNumber: { description: 'DOC123' },
        sex: { description: 'M' },
        additionalAddressInformation: { description: 'Province District Village' },
      },
      backVizResult: {
        dateOfIssue: { originalDateStringResult: { description: '01.01.2010' } },
        documentAdditionalNumber: { description: 'ADD123' },
        dateOfExpiry: { originalDateStringResult: { description: '01.01.2030' } },
      },
      fathersName: { description: 'Father Name' },
      address: { description: 'Street 1\nCity' },
      fullDocumentFrontImage: 'FRONTBASE64',
      fullDocumentBackImage: 'BACKBASE64',
      faceImage: 'FACEBASE64',
      dependentsInfo: [{ name: 'Child' }],
    };

    // Access private method via prototype
    const extract = (BlinkIdScanningService as any).prototype.extractResult as Function;
    const result = extract.call(null, raw);

    expect(result).toBeTruthy();
    expect(result.frontData.fullName).toBe('John Doe');
    expect(result.frontData.dateOfBirth).toBe('01.01.1990');
    expect(result.frontData.documentNumber).toBe('DOC123');
    expect(result.frontData.fathersName).toBe('Father Name');
    expect(result.frontData.address).toBe('Street 1 City');
    expect(result.frontData.province).toBe('Province');
    expect(result.frontData.district).toBe('District');
    expect(result.frontData.village).toBe('Village');
    expect(result.frontData.sex).toBe('M');

    expect(result.backData.dateOfIssue).toBe('01.01.2010');
    expect(result.backData.documentAdditionalNumber).toBe('ADD123');
    expect(result.backData.dateOfExpiry).toBe('01.01.2030');

    expect(result.frontImage).toContain('data:image/jpg;base64,FRONTBASE64');
    expect(result.backImage).toContain('data:image/jpg;base64,BACKBASE64');
    expect(result.DocumentFace).toContain('data:image/jpg;base64,FACEBASE64');
    expect(typeof result.dependentsInfo).toBe('object');
  });

  it('returns null when both front and back viz results are empty', () => {
    const raw: any = {
      frontVizResult: { empty: true },
      backVizResult: { empty: true },
    };

    const extract = (BlinkIdScanningService as any).prototype.extractResult as Function;
    const result = extract.call(null, raw);
    expect(result).toBeNull();
  });
});
