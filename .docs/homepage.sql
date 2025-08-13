CREATE OR REPLACE VIEW homepage AS
SELECT
    'notice' as type,
    id,
    created_at,
    title,
    description,
    urgency,
    start_date,
    end_date,
    user_id,
    null as event_start_date,
    null as event_end_date,
    null as location,
    null as image_url,
    null as category,
    null as date,
    null as contact
FROM notices
ORDER BY created_at DESC
LIMIT 5

UNION ALL

SELECT
    'event' as type,
    id,
    created_at,
    title,
    description,
    null as urgency,
    event_start_date as start_date,
    event_end_date as end_date,
    user_id,
    event_start_date,
    event_end_date,
    location,
    image_url,
    category,
    null as date,
    null as contact
FROM events
ORDER BY event_start_date ASC
LIMIT 5

UNION ALL

SELECT
    'lost_and_found' as type,
    id,
    created_at,
    title,
    description,
    null as urgency,
    null as start_date,
    null as end_date,
    user_id,
    null as event_start_date,
    null as event_end_date,
    location,
    image_url,
    category,
    date,
    contact
FROM lost_and_found
ORDER BY created_at DESC
LIMIT 4

UNION ALL

SELECT
    'service' as type,
    id,
    created_at,
    title,
    description,
    null as urgency,
    start_date,
    end_date,
    user_id,
    null as event_start_date,
    null as event_end_date,
    null as location,
    image_url,
    category,
    null as date,
    null as contact
FROM services
ORDER BY created_at DESC
LIMIT 5;