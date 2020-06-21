TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE; 

INSERT INTO noteful_folders (name)
VALUES 
    ('Important'),
    ('Super'),
    ('Spangly');

INSERT INTO noteful_notes (name, modified, content, "folderId")
VALUES 
    ('Test Note 1', now(), 'Test Content 1', 1),
    ('Test Note 2', now(), 'Test Content 2', 1),
    ('Test Note 3', now(), 'Test Content 3', 2),
    ('Test Note 4', now(), 'Test Content 4', 3);
