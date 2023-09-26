const express = require("express");
const middleware = require("../middleware/authentication");
const groupContoller = require("../Controllers/groupController");
const router = express.Router();

router.post(
  "/create-group",
  middleware.authenticateToken,
  groupContoller.createGroup
);
router.get(
  "/get-groups",
  middleware.authenticateToken,
  groupContoller.getGroups
);
router.get(
  "/:group_id/isAdmin",
  middleware.authenticateToken,
  groupContoller.isAdmin
);

router.post(
  "/:group_id/invite",
  middleware.authenticateToken,
  groupContoller.imviteMember
);
module.exports = router;
