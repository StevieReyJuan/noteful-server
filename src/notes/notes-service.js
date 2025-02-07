const NotesService = {
    getAllNotes(knex) {
        return knex
            .select('*')
            .from('noteful_notes')
    },
    insertNote(knex, newNote) {
        return knex
            .insert(newNote)
            .into('noteful_notes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex
            .from('noteful_notes')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteNote(knex, id) {
        return knex
            .from('noteful_notes')
            .where('id', id)
            .delete()
    },
    updateNote(knex, id, newNoteFields) {
        return knex
            .from('noteful_comments')
            .where('id', id)
            .update(newNoteFields)
    }
}

module.exports = NotesService;