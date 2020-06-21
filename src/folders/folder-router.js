const path = require('path')
const express = require('express')
const xss = require('xss')
const FolderService = require('./folder-service')

const folderRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
    id: folder.id,
    name: xss(folder.name)
})

folderRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FolderService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name } = req.body
        const newFolder = { name }

        if (!name) {
            return res.status(400).json({
                error: { message: `Missing folder 'name' in request body` }
            })
        }
        const knexInstance = req.app.get('db')
        FolderService.insertFolder(knexInstance, newFolder)
            .then(folder => {
                res
                    .status(201)
                    // .location(`/folders/${folders.name}`)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(folder)
            })
            .catch(next)
    })

folderRouter
    .route('/:folderId')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        const { folderId } = req.params
        FolderService.getById(knexInstance, folderId)
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({
                        error: { message: `Folder not found`}
                    })
                }
                res.folder = folder
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeFolder(res.folder))
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        const { folderId } = req.params
        FolderService.deleteFolder(knexInstance, folderId)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { name } = req.body
        const folderToUpdate = { name }

        if (folderToUpdate.name == null) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain folder 'name'`
                }
            })
        }
        const knexInstance = req.app.get('db')
        const { folderId } = req.params

        FolderService.updateFolder(
            knexInstance, 
            folderId, 
            folderToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = folderRouter;