# Security Spec: AMEPA Auditoria - Firebase Security Rules

## 1. Data Invariants
- An audit must have a valid identifier (`isValidId(auditId)`), sectorId, non-empty evaluator name, valid score (0-100), and responses map.
- A sector must have a valid identifier (`isValidId(sectorId)`), non-empty name, description, icon string, and questions array.
- Catch-all default deny on all undefined collections (`match /{document=**} { allow read, write: if false; }`).
- Authenticated users can read and write audits and sectors. Unauthenticated public access to write/delete records is strictly prevented.

## 2. Dirty Dozen Test Payloads
1. **Unauthenticated Write**: Payload trying to insert an audit without any authentication -> REJECT
2. **Path Traversal / Malformed ID**: Document ID with junk characters or length > 128 (e.g. `../../secret`) -> REJECT
3. **Score Out of Bounds (Negative)**: `score: -15` -> REJECT
4. **Score Out of Bounds (>100)**: `score: 150` -> REJECT
5. **Ghost Field Injection**: Adding forbidden field `__role: 'admin'` or shadow field -> REJECT
6. **Missing Required Field in Audit**: Omitting `evaluator` or `sectorId` -> REJECT
7. **Invalid Sector Questions Type**: Sector payload where `questions` is a string instead of an array -> REJECT
8. **Oversized String Injection**: Evaluator string exceeding 150 chars or criticalNotes > 2000 chars -> REJECT
9. **Sector Name Missing**: Creating sector without `name` -> REJECT
10. **Tampering with Immutable ID**: Updating document where `incoming().id != existing().id` -> REJECT
11. **Arbitrary Status Value**: `status: 'hacked'` (must be 'em_andamento' or 'finalizado') -> REJECT
12. **Malformed Response Item**: Invalid type in response payload -> REJECT
