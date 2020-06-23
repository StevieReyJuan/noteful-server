const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    content: xss(note.content),
    folderId: note.folderId
})

notesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, modified, content, folderId } = req.body
        const newNote = { name, content, folderId }

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing note '${key}' in request body` }
                })
        }
        newNote.modified = modified
        
        const knexInstance = req.app.get('db')

        NotesService.insertNote(knexInstance, newNote)
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note))
            })
            .catch(next)
    })

notesRouter
    .route('/:noteId')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        const { noteId } = req.params
        NotesService.getById(knexInstance, noteId)
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: `Note not found` }
                    })
                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeNote(res.note))
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        const { noteId } = req.params
        NotesService.deleteNote(knexInstance, noteId)
            // .then(numRowsAffected => {
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { name, content, folderId } = req.body
        const noteToUpdate = { name, content, folderId }

        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length

        if (numberOfValues.length === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must note 'name' or 'folderId'`
                }
            })
        }
        
        const knexInstance = req.app.get('db')
        const { noteId } = req.params

        NotesService.updateNote(knex, noteId, noteToUpdate)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })  

module.exports = notesRouter;