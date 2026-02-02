import { formatScanResults } from './format-results';

describe('formatScanResults', () => {
  const t = (key: string) => {
    const map: Record<string, string> = {
      'results.fullName': 'Full Name',
      'results.dateOfBirth': 'DOB',
      'results.documentNumber': 'Doc No',
      'results.fathersName': "Father's Name",
      'results.address': 'Address',
      'results.sex': 'Sex',
      'results.dateOfIssue': 'Issue Date',
      'results.documentAdditionalNumber': 'Add. No',
      'results.dateOfExpiry': 'Expiry Date',
    };
    return map[key] ?? key;
  };

  it('formats single result correctly', () => {
    const results = [
      {
        frontData: {
          fullName: 'Alice Example',
          dateOfBirth: '01.01.1990',
          documentNumber: 'ABC123',
          fathersName: 'Bob',
          address: 'Street 1',
          province: 'P',
          district: 'D',
          village: 'V',
          sex: 'F',
        },
        backData: {
          dateOfIssue: '01.01.2010',
          documentAdditionalNumber: 'X1',
          dateOfExpiry: '01.01.2030',
        },
        frontImage: '',
        backImage: '',
        dependentsInfo: null,
        DocumentFace: '',
      },
    ] as any;

    const out = formatScanResults(results, t);
    expect(out).toContain('Full Name: Alice Example');
    expect(out).toContain('DOB: 01.01.1990');
    expect(out).toContain('Doc No: ABC123');
    expect(out).toContain("Father's Name: Bob");
    expect(out).toContain('Address: Street 1');
    expect(out).toContain('Sex: F');
    expect(out).toContain('Issue Date: 01.01.2010');
    expect(out).toContain('Add. No: X1');
    expect(out).toContain('Expiry Date: 01.01.2030');
  });

  it('returns empty string for empty input', () => {
    expect(formatScanResults([], t)).toBe('');
  });

  it('handles missing backData gracefully', () => {
    const results = [
      {
        frontData: {
          fullName: 'Bob',
          dateOfBirth: '',
          documentNumber: '',
          fathersName: '',
          address: '',
          province: '',
          district: '',
          village: '',
          sex: '',
        },
        backData: null,
        frontImage: '',
        backImage: '',
        dependentsInfo: null,
        DocumentFace: '',
      },
    ] as any;

    const out = formatScanResults(results, t);
    expect(out).toContain('Full Name: Bob');
    expect(out).toContain('Issue Date: ');
  });
});
