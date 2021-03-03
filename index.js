/*jshint esversion: 6 */
const Joi = require('joi');
const express = require('express');
const app = express();
const fetch = require('node-fetch');

app.use(express.json());

let courses = [
	{ id: 1, name: 'course1' },
	{ id: 2, name: 'course2' },
	{ id: 3, name: 'course3' },
];

const url = [
	'http://datos.minem.gob.ar/api/3/action/datastore_search?offset=000&resource_id=d87ca6ab-2979-474b-994a-e4ba259bb217#',
	'http://datos.minem.gob.ar/api/3/action/datastore_search?offset=100&resource_id=d87ca6ab-2979-474b-994a-e4ba259bb217#',
	'http://datos.minem.gob.ar/api/3/action/datastore_search?offset=200&resource_id=d87ca6ab-2979-474b-994a-e4ba259bb217#',
	'http://datos.minem.gob.ar/api/3/action/datastore_search?offset=300&resource_id=d87ca6ab-2979-474b-994a-e4ba259bb217#',
	'http://datos.minem.gob.ar/api/3/action/datastore_search?offset=400&resource_id=d87ca6ab-2979-474b-994a-e4ba259bb217#',
];

(function acumulado() {
	let arr = [];
	url.map(el => {
		// console.log(el);
		fetch(el)
			.then(res => res.json())
			.then(data => {
				arr = arr.concat(data.result.records);
			});
	});

	app.get('/api/courses', (req, res) => {
		arr = arr
			.sort(function (a, b) {
				if (a.id_pub > b.id_pub) {
					return 1;
				}
				if (a.id_pub < b.id_pub) {
					return -1;
				}
				// a must be equal to b
				return 0;
			})
			.filter(elt => elt.contrato === 'TOTAL');
		res.send(arr);
	});
})();

app.get('/', (req, res) => {
	res.send('Hello World!!');
});

// app.get('/api/courses', (req, res) => res.send(courses));

app.post('/api/courses', (req, res) => {
	const { error } = validateCourse(req.body);
	if (error) return res.status(404).send(result.error.details[0].message);

	const course = {
		id: courses.length + 1,
		name: req.body.name,
	};
	courses.push(course);
	res.send(course);
});

app.get('/api/courses/:id', (req, res) => {
	const course = courses.find(c => c.id === parseInt(req.params.id));
	if (!course)
		return res
			.status(404)
			.send('The course with the given id was not found');
	res.send(course);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

app.put('/api/courses/:id', (req, res) => {
	const course = courses.find(c => c.id === parseInt(req.params.id));
	if (!course) {
		return res
			.status(404)
			.send('The course with the given id was not found');
	}

	const { error } = validateCourse(req.body);
	if (error) return res.status(404).send(error.details[0].message);

	course.name = req.body.name;
	res.send(course);
});

function validateCourse(course) {
	const schema = {
		name: Joi.string().min(3).required(),
	};
	return Joi.validate(course, schema);
}

app.delete('/api/courses/:id', (req, res) => {
	const course = courses.find(c => c.id === parseInt(req.params.id));
	if (!course)
		return res
			.status(404)
			.send('The course with the given id was not found');
	const index = courses.indexOf(course);
	courses.splice(index, 1);
	res.send(course);
});
