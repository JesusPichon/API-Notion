const { Client } = require('@notionhq/client');

require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;

const apiKey = process.env.NOTION_API_KEY;
const pageId = process.env.NOTION_PAGE_ID;

const notion = new Client({ auth: apiKey });

const agregarTarea = async (nombre, descripcion) => {
    try {
        const response = await notion.pages.create({
            parent: { database_id: pageId },
            properties: {
                "Nombre de la Tarea": {
                    "title": [
                        {
                            "text": {
                                "content": nombre
                            }
                        }
                    ]
                },
                "Descripción": {
                    "rich_text": [
                        {
                            "text": {
                                "content": descripcion
                            }
                        }
                    ]
                },
                "Estado": {
                    "status": {
                        "name": "Sin empezar"
                    }
                }
            }
        });
        return true;
    } catch (error) {
        console.error('Error al agregar la fila: ', error);
        return false;
    }
}

const getTareasSinEmpezar = async () => {
    try {
        const response = await notion.databases.query({
            database_id: pageId,
            filter: {
                property: "Estado",
                status: {
                    equals: "Sin empezar"
                }
            }
        });

        let listaTareas = response.results.map((item) => {
            return item.properties["Nombre de la Tarea"].title[0].plain_text;
        });

        return listaTareas;
    } catch (err) {
        console.error(err);
        return [];
    }
}

const getTareasEnCurso = async () => {
    try {
        const response = await notion.databases.query({
            database_id: pageId,
            filter: {
                property: "Estado",
                status: {
                    equals: "En curso"
                }
            }
        });

        let listaTareas = response.results.map((item) => {
            return item.properties["Nombre de la Tarea"].title[0].plain_text;
        });

        return listaTareas;
    } catch (err) {
        console.error(err);
        return [];
    }
}

const getTareasCompletadas = async () => {
    try {
        const response = await notion.databases.query({
            database_id: pageId,
            filter: {
                and: [{
                    property: "Estado",
                    status: {
                        equals: "Listo"
                    }
                }]
            }
        });

        let listaTareas = response.results.map((item) => {
            return item.properties["Nombre de la Tarea"].title[0].plain_text;
        });

        return listaTareas;

    } catch (err) {
        console.error(err);
        return [];
    }
}

const getTareas = async () => {
    try {
        const response = await notion.databases.query({
            database_id: pageId,
            filter: {
                or: [
                    {
                        property: "Estado",
                        status: {
                            equals: "Listo"
                        }
                    },
                    {
                        property: "Estado",
                        status: {
                            equals: "Sin empezar"
                        }
                    },
                    {
                        property: "Estado",
                        status: {
                            equals: "En curso"
                        }
                    }
                ]
            }
        });

        let listaTareas = response.results.map((item) => {
            return item.properties["Nombre de la Tarea"].title[0].plain_text;
        });

        return listaTareas;

    } catch (err) {
        console.error(err);
        return [];
    }
}

app.get('/tareas', async (req, res) => {
    const tipo = req.query.tipo;
    let tareas = null;
    if ('sin_empezar' === tipo) {
        tareas = await getTareasSinEmpezar();
        res.send(tareas);
    }

    if ('en_curso' === tipo) {
        tareas = await getTareasEnCurso();
        res.send(tareas);
    }

    if ('listo' === tipo) {
        tareas = await getTareasCompletadas();
        res.send(tareas);
    }

    if ('todas' === tipo) {
        tareas = await getTareas();
        res.send(tareas);
    }
});


app.get('/todasTareas', async (req, res) => {
    const response = await notion.databases.query({
        database_id: pageId,
        filter: {
            or: [
                {
                    property: "Estado",
                    status: {
                        equals: "Listo"
                    }
                },
                {
                    property: "Estado",
                    status: {
                        equals: "Sin empezar"
                    }
                },
                {
                    property: "Estado",
                    status: {
                        equals: "En curso"
                    }
                }
            ]
        }
    });
    res.send(response);
})

app.get('/agregar', async (req, res) => {
    const nombre = req.query.nombre;
    const descripcion = req.query.descripcion;

    const success = await agregarTarea(nombre, descripcion);

    if (success === true) {
        res.send(true);
    } else {
        res.send(false);
    }
});




app.listen(port, () => {
    console.log(`App escuchando en el puerto ${port}`)
})