# ADR-006: Sequelize Factory Pattern with Deferred Associations

**Status:** Accepted
**Date:** 2026-04-01

**Context:** Sequelize models that reference each other create circular dependency problems when associations are defined inline. The model initialization order matters, and eager association setup can fail when a referenced model has not yet been loaded.

**Decision:** Each model file exports a factory function that receives the `sequelize` instance and `DataTypes`, and returns the model class. Associations are defined separately in a static `associate` method. The `models/index.js` barrel file runs in two passes:

1. **First pass:** Call each factory to register the model.
2. **Second pass:** Call `model.associate(models)` on every model that defines it.

**Consequences:**
- Eliminates circular dependency issues between models.
- All models are guaranteed to be registered before any associations run.
- Follows the Sequelize CLI convention, easing migration tooling.
- Requires the two-pass initialization pattern in `models/index.js`.
