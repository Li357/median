const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

async function zipDirectory(source, out) {
  const archive = archiver('zip', { zlib: { level: 9 }});
  await fs.promises.mkdir(path.dirname(out), { recursive: true });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

zipDirectory('src/', path.resolve(process.argv[2], 'Median.zip'))
