// Code generated by tygo. DO NOT EDIT.

//////////
// source: discordgo.go

export type Permissions = string;
/**
 * 	A role tags object from serenity because discordgo doesnt actually support this
 * /// The Id of the bot the [`Role`] belongs to.
 * 	pub bot_id: Option<UserId>,
 * 	/// The Id of the integration the [`Role`] belongs to.
 * 	pub integration_id: Option<IntegrationId>,
 * 	/// Whether this is the guild's premium subscriber role.
 * 	#[serde(default, skip_serializing_if = "is_false", with = "bool_as_option_unit")]
 * 	pub premium_subscriber: bool,
 * 	/// The id of this role's subscription sku and listing.
 * 	pub subscription_listing_id: Option<SkuId>,
 * 	/// Whether this role is available for purchase.
 * 	#[serde(default, skip_serializing_if = "is_false", with = "bool_as_option_unit")]
 * 	pub available_for_purchase: bool,
 * 	/// Whether this role is a guild's linked role.
 * 	#[serde(default, skip_serializing_if = "is_false", with = "bool_as_option_unit")]
 * 	pub guild_connections: bool,
 */
export interface SerenityRoleTags {
  bot_id?: string;
  integration_id?: string;
  premium_subscriber: boolean;
  subscription_listing_id?: string;
  available_for_purchase: boolean;
  guild_connections: boolean;
}
/**
 * 		A role object from serenity because discordgo's Role object is garbage
 * 	    pub id: RoleId,
 * 	    pub guild_id: GuildId,
 * 	    pub colour: Colour,
 * 	    pub name: FixedString<u32>,
 * 	    pub permissions: Permissions,
 * 	    pub position: i16,
 * 	    pub tags: RoleTags,
 * 	    pub icon: Option<ImageHash>,
 * 	    pub unicode_emoji: Option<FixedString<u32>>,
 */
export interface SerenityRole {
  id: string;
  guild_id: string;
  color: number /* int */;
  name: string;
  permissions?: Permissions;
  position: number /* int16 */;
  tags?: SerenityRoleTags;
  icon?: string;
  unicode_emoji: string;
}
