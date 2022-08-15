import {utils} from "@lib/utils";
import {RelationshipPublic} from "./typings";

export const RELATIONSHIP_STATUS = utils.AssertRecordType<RelationshipPublic>()(
  {
    FRIEND_REQ_1_2: 0,
    FRIEND_REQ_2_1: 1,
    FRIENDS: 2,
    BLOCKED_1_2: 3,
    BLOCKED_2_1: 4,
    BLOCKED: 5,
    NONE: 6,
  },
);

export const RELATIONSHIP_STATUSES = [
  RELATIONSHIP_STATUS.FRIEND_REQ_1_2,
  RELATIONSHIP_STATUS.FRIEND_REQ_2_1,
  RELATIONSHIP_STATUS.FRIENDS,
  RELATIONSHIP_STATUS.BLOCKED_1_2,
  RELATIONSHIP_STATUS.BLOCKED_2_1,
  RELATIONSHIP_STATUS.BLOCKED,
  RELATIONSHIP_STATUS.NONE,
];
