// import pdf from 'pdf-parse';
// import mammoth from 'mammoth';

/**
 * PDF 파일에서 텍스트 추출
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  // PDF parsing temporarily disabled
  throw new Error('PDF 파일 지원이 곧 제공됩니다');
}

/**
 * DOCX 파일에서 텍스트 추출
 */
export async function parseDOCX(buffer: Buffer): Promise<string> {
  // DOCX parsing temporarily disabled
  throw new Error('DOCX 파일 지원이 곧 제공됩니다');
}

/**
 * TXT 파일에서 텍스트 추출
 */
export function parseTXT(buffer: Buffer): string {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('TXT 파싱 에러:', error);
    throw new Error('TXT 파일을 읽을 수 없습니다');
  }
}

/**
 * 파일 타입에 따라 적절한 파서 선택
 */
export async function parseFile(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return parsePDF(buffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return parseDOCX(buffer);
  } else if (mimeType === 'text/plain') {
    return parseTXT(buffer);
  } else {
    throw new Error('지원하지 않는 파일 형식입니다');
  }
}

/**
 * 파일 크기 검증 (최대 10MB)
 */
export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size <= maxSize;
}

/**
 * 파일 타입 검증
 */
export function validateFileType(mimeType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];
  return allowedTypes.includes(mimeType);
}
