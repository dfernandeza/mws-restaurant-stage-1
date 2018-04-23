//https://github.com/yourdeveloper/node-imagemagick

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const im = require('imagemagick');
const images_src_path = './src/img/';
const images_dist_path = './dist/img/';
const images = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const config = {
	quality: 0.85,
	format: 'jpg'
};
const promises = [];

for (let img of images) {
	promises.push(
		im.resize(
			Object.assign({}, config, {
				srcPath: `${images_src_path}${img}.jpg`,
				dstPath: `${images_dist_path}${img}.jpg`,
				width: 800
			}),
			function(err, stdout, stderr) {
				if (err) throw err;
				console.log(`resized ${img} to lg`);
			}
		)
	);

	promises.push(
		im.resize(
			Object.assign({}, config, {
				srcPath: `${images_src_path}${img}.jpg`,
				dstPath: `${images_dist_path}${img}_sm.jpg`,
				width: 320
			}),
			function(err, stdout, stderr) {
				if (err) throw err;
				console.log(`resized ${img} to sm`);
			}
		)
	);

	promises.push(
		im.resize(
			Object.assign({}, config, {
				srcPath: `${images_src_path}${img}.jpg`,
				dstPath: `${images_dist_path}${img}_sm2x.jpg`,
				width: 640
			}),
			function(err, stdout, stderr) {
				if (err) throw err;
				console.log(`resized ${img} to sm2x`);
			}
		)
	);
}

Promise.all(promises).then(() =>
	imagemin([`${images_dist_path}*.jpg`], images_dist_path, {
		plugins: [imageminJpegtran({ progressive: true })]
	}).then(files => {
		console.log(files);
	})
);
