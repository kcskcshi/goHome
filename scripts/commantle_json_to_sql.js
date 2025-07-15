const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../public/commantle_keyword_list.json');
const outPath = path.join(__dirname, './commantle_keywords_insert.sql');

const raw = fs.readFileSync(jsonPath, 'utf-8');
const data = JSON.parse(raw);

const values = data.words.map((item, idx) => {
  const keyword = item.keyword.replace(/'/g, "''");
  const related = JSON.stringify(item.related).replace(/'/g, "''");
  return `('${keyword}', '${related}', ${idx})`;
});

const sql = `INSERT INTO commantle_keywords (keyword, related, "order") VALUES\n${values.join(',\n')};\n`;

fs.writeFileSync(outPath, sql, 'utf-8');
console.log('SQL 파일 생성 완료:', outPath); 