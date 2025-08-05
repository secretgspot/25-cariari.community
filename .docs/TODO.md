# TODO

- [ ] Larger than mobile styling
- [x] {@html formatText(truncateText(stripMarkdown(notice.description), 200))} in /notices causes hydration mismatch (was caused by it being wrapped in p instead of div and content inside was also made of p so style was affecting it)
