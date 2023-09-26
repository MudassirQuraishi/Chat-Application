const Group = require("../Models/groupModel");
const GroupMembers = require("../Models/groupMemberModel");

exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { user } = req;
    const response = await Group.create({
      group_name: name,
      group_description: description,
      createdByUserId: user.id,
    });
    const { dataValues } = response;
    const addAdmin = await GroupMembers.create({
      userId: dataValues.createdByUserId,
      groupId: dataValues.id,
      is_admin: true,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.getGroups = async (req, res) => {
  const { user } = req;
  const groupMember = await GroupMembers.findAll({
    where: {
      userId: user.id,
    },
  });
  const groupIds = [];
  groupMember.map((group, i) => {
    groupIds[i] = group.dataValues.groupId;
  });
  const groups = await Group.findAll({ where: { id: groupIds } });
  res.status(200).json({ success: true, data: groups });
};

exports.imviteMember = async (req, res) => {
  try {
    const { id } = req.user;
    const { group_id } = req.params;
    const user_ids = req.body.user_ids; // An array of user_ids to invite

    // Verify that the group exists
    const group = await Group.findByPk(group_id);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Invite each user to the group
    for (const user_id of user_ids) {
      await GroupMembers.create({
        groupId: group_id,
        userId: user_id,
        is_admin: false, // Assuming invited users are not admins by default
      });
    }

    res.status(204).send(); // Successfully invited users
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to invite users" });
  }
};
exports.isAdmin = async (req, res) => {
  try {
    const { group_id } = req.params;
    const { user } = req;
    const currentGroup = await GroupMembers.findOne({
      where: {
        groupId: group_id,
        is_admin: true,
      },
      attributes: ["userId"],
    });
    const isAdmin = currentGroup.userId === user.id ? true : false;
    res.status(200).json({ success: true, isAdmin: isAdmin });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false });
  }
};
