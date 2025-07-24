/**
 * Date 객체나 날짜 문자열을 'YYYY-MM-DD HH:mm:ss' 형식으로 변환합니다.
 * ex. 2025-07-23T12:40 -> 2025-07-23 12:40:00
 * @param {Date | string} date - 변환할 날짜
 * @returns {string | null} - 변환된 문자열 또는 날짜가 없으면 null
 */
export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) {
    return null;
  }

  const d = new Date(date);

  // Date 객체가 유효하지 않은 경우(예: new Date('invalid-string')) null 반환
  if (isNaN(d.getTime())) {
    return null;
  }

  const pad = (num) => num.toString().padStart(2, '0');

  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1); // getMonth()는 0부터 시작하므로 +1
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  switch (format) {
    case 'YYYY-MM-DD':
      return `${yyyy}-${MM}-${dd}`;

    case 'YYYY-MM-DD HH:mm:ss':
    default: // format 인자가 없거나 다른 값이 들어오면 기본 형식으로 반환
      return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
  }
};

/**
 * 타임스탬프를 'YYYY-MM-DD' 형식의 문자열로 변환하는 함수입니다.
 * @param {number} timestamp - 변환할 타임스탬프 숫자
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatTimestampToDate = (timestamp) => {
  // 타임스탬프 값이 유효하지 않으면 빈 문자열을 반환합니다.
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const year = date.getFullYear();
  // getMonth()는 0부터 시작하므로 1을 더하고, 10보다 작으면 앞에 '0'을 붙여줍니다.
  const month = String(date.getMonth() + 1).padStart(2, '0');
  // getDate()가 10보다 작으면 앞에 '0'을 붙여줍니다.
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/** 주말인지 확인하는 함수 (토: 6, 일: 0) */
export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

/** 두 날짜 사이의 실제 강의 일수(평일)를 계산하는 함수 */
export const calculateBusinessDays = (start, end) => {
  if (!start || !end) return 0;

  let count = 0;
  const curDate = new Date(start);
  const lastDate = new Date(end);

  if (curDate > lastDate) return 0;

  while (curDate <= lastDate) {
    if (!isWeekend(curDate)) {
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
};
