type DispatchPayload = READY | READY_SUPPLEMENTAL | PRESENCE_UPDATE | MESSAGE_CREATE | MESSAGE_UPDATE | CHANNEL_PINS_UPDATE | CHANNEL_UPDATE | MESSAGE_REACTION_ADD | MESSAGE_REACTION_REMOVE | MESSAGE_DELETE | VOICE_STATE_UPDATE | MESSAGE_REACTION_REMOVE_EMOJI | MESSAGE_ACK | GUILD_JOIN_REQUEST_CREATE | GUILD_CREATE | GUILD_JOIN_REQUEST_UPDATE | PASSIVE_UPDATE_V1 | GUILD_MEMBER_UPDATE | CHANNEL_DELETE | CHANNEL_CREATE | THREAD_CREATE | THREAD_UPDATE | USER_NOTE_UPDATE | GUILD_BAN_ADD | EMBEDDED_ACTIVITY_UPDATE | MESSAGE_DELETE_BULK | GUILD_APPLICATION_COMMAND_INDEX_UPDATE | GUILD_BAN_REMOVE | SESSIONS_REPLACE | USER_GUILD_SETTINGS_UPDATE | GUILD_FEATURE_ACK | USER_SETTINGS_PROTO_UPDATE | GUILD_UPDATE | INTERACTION_CREATE | INTERACTION_SUCCESS | USER_UPDATE | USER_REQUIRED_ACTION_UPDATE | GUILD_INTEGRATIONS_UPDATE | INTEGRATION_UPDATE | STAGE_INSTANCE_CREATE | RESUMED | STAGE_INSTANCE_DELETE | CALL_CREATE | TYPING_START | CALL_UPDATE | GUILD_APPLICATION_COMMAND_COUNTS_UPDATE | CHANNEL_PINS_ACK | USER_CONNECTIONS_UPDATE | OAUTH2_TOKEN_REVOKE | RELATIONSHIP_UPDATE | RELATIONSHIP_REMOVE | RELATIONSHIP_ADD | NOTIFICATION_CENTER_ITEM_CREATE | INVITE_CREATE | GUILD_ROLE_UPDATE | GUILD_ROLE_CREATE | GUILD_ROLE_DELETE | CALL_DELETE | MESSAGE_REACTION_REMOVE_ALL | THREAD_DELETE | GUILD_SCHEDULED_EVENT_USER_ADD;
export default DispatchPayload;

export type CALL_CREATE = CALL_CREATE$;
interface CALL_CREATE$ {
	voice_states: ({
		user_id: string;
		suppress: boolean;
		session_id: string;
		self_video: boolean;
		self_mute: boolean;
		self_deaf: boolean;
		request_to_speak_timestamp: null;
		mute: boolean;
		deaf: boolean;
		channel_id: string;
	})[];
	ringing: [];
	region: string;
	message_id: string;
	channel_id: string;
}

export type CALL_DELETE = CALL_DELETE$;
interface CALL_DELETE$ {
	channel_id: string;
}

export type CALL_UPDATE = CALL_UPDATE$;
interface CALL_UPDATE$ {
	ringing: (string)[];
	region: string;
	message_id: string;
	guild_id: null;
	channel_id: string;
}

export type CHANNEL_CREATE = CHANNEL_CREATE$;
interface CHANNEL_CREATE$ {
	version?: number;
	user_limit?: number;
	type: number;
	rtc_region?: null;
	rate_limit_per_user?: number;
	position?: number;
	permission_overwrites?: ({
		type: number;
		id: string;
		deny: string;
		allow: string;
	})[];
	parent_id?: string | null;
	nsfw?: boolean;
	name?: string;
	last_message_id?: null | string;
	id: string;
	hashes?: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	guild_id?: string;
	guild_hashes?: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	flags: number;
	bitrate?: number;
	recipients?: ({
		username: string;
		public_flags: number;
		id: string;
		discriminator: string;
		bot?: boolean;
		avatar_decoration: null;
		avatar: string;
	})[];
	topic?: null | string;
	owner_id?: string;
	icon?: string;
}

export type CHANNEL_DELETE = CHANNEL_DELETE$;
interface CHANNEL_DELETE$ {
	version?: number;
	user_limit?: number;
	type: number;
	rtc_region?: null;
	rate_limit_per_user?: number;
	position?: number;
	permission_overwrites?: ({
		type: number;
		id: string;
		deny: string;
		allow: string;
	})[];
	parent_id?: string | null;
	nsfw?: boolean;
	name?: string;
	last_message_id: string | null;
	id: string;
	hashes?: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	guild_id?: string;
	guild_hashes?: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	flags: number;
	bitrate?: number;
	topic?: string | null;
	last_pin_timestamp?: string;
	default_thread_rate_limit_per_user?: number;
}

export type CHANNEL_PINS_ACK = CHANNEL_PINS_ACK$;
interface CHANNEL_PINS_ACK$ {
	version: number;
	timestamp: string;
	channel_id: string;
}

export type CHANNEL_PINS_UPDATE = CHANNEL_PINS_UPDATE$;
interface CHANNEL_PINS_UPDATE$ {
	last_pin_timestamp: null | string;
	channel_id: string;
	guild_id: string;
}

export type CHANNEL_UPDATE = CHANNEL_UPDATE$;
interface CHANNEL_UPDATE$ {
	version: number;
	type: number;
	topic?: string | null;
	rate_limit_per_user: number;
	position: number;
	permission_overwrites: ({
		type: number;
		id: string;
		deny: string;
		allow: string;
	})[];
	parent_id: string | null;
	nsfw: boolean;
	name: string;
	last_pin_timestamp?: string;
	last_message_id: string | null;
	id: string;
	hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	guild_id: string;
	guild_hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	flags: number;
	default_thread_rate_limit_per_user?: number;
	user_limit?: number;
	rtc_region?: null | string;
	bitrate?: number;
	video_quality_mode?: number;
	template?: string;
	default_sort_order?: null;
	default_reaction_emoji?: null | {
		emoji_name: null;
		emoji_id: string;
	};
	default_forum_layout?: number;
	default_auto_archive_duration?: number;
	available_tags?: ({
		name: string;
		moderated: boolean;
		id: string;
		emoji_name: string | null;
		emoji_id: null | string;
	})[];
}

export type EMBEDDED_ACTIVITY_UPDATE = EMBEDDED_ACTIVITY_UPDATE$;
interface EMBEDDED_ACTIVITY_UPDATE$ {
	users: (string)[];
	update_code: number;
	guild_id: string;
	embedded_activity: {
		type?: null;
		timestamps?: null;
		state?: null;
		secrets?: null;
		name?: string;
		details?: null;
		created_at?: null;
		assets?: null;
		application_id: string;
		activity_id?: string;
	};
	connections: ({
		user_id: string;
		metadata: {
			is_eligible_host: boolean;
		};
	})[];
	channel_id: string;
}

export type GUILD_APPLICATION_COMMAND_COUNTS_UPDATE = GUILD_APPLICATION_COMMAND_COUNTS_UPDATE$;
interface GUILD_APPLICATION_COMMAND_COUNTS_UPDATE$ {
	application_command_counts: {
		1: number;
		3?: number;
	};
	guild_id: string;
}

export type GUILD_APPLICATION_COMMAND_INDEX_UPDATE = GUILD_APPLICATION_COMMAND_INDEX_UPDATE$;
interface GUILD_APPLICATION_COMMAND_INDEX_UPDATE$ {
	hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	guild_hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	application_command_counts: {
		1?: number;
		2?: number;
		3?: number;
	};
	guild_id: string;
}

export type GUILD_BAN_ADD = GUILD_BAN_ADD$;
interface GUILD_BAN_ADD$ {
	user: {
		username: string;
		public_flags: number;
		id: string;
		discriminator: string;
		avatar_decoration: null;
		avatar: string | null;
	};
	guild_id: string;
}

export type GUILD_BAN_REMOVE = GUILD_BAN_REMOVE$;
interface GUILD_BAN_REMOVE$ {
	user: {
		username: string;
		public_flags: number;
		id: string;
		discriminator: string;
		avatar_decoration: null;
		avatar: string;
	};
	guild_id: string;
}

export type GUILD_CREATE = GUILD_CREATE$;
interface GUILD_CREATE$ {
	voice_states: ({
		user_id: string;
		suppress: boolean;
		session_id: string;
		self_video: boolean;
		self_mute: boolean;
		self_deaf: boolean;
		request_to_speak_timestamp: null;
		mute: boolean;
		deaf: boolean;
		channel_id: string;
		self_stream?: boolean;
	})[];
	version: number;
	threads: [];
	stickers: ({
		type: number;
		tags: string;
		name: string;
		id: string;
		guild_id: string;
		format_type: number;
		description: string | null;
		available: boolean;
		asset?: string;
	})[];
	stage_instances: [];
	roles: ({
		unicode_emoji: null | string;
		tags: {
			bot_id?: string;
			premium_subscriber?: null;
			integration_id?: string;
			subscription_listing_id?: string;
			available_for_purchase?: null;
		};
		position: number;
		permissions: string;
		name: string;
		mentionable: boolean;
		managed: boolean;
		id: string;
		icon: null | string;
		hoist: boolean;
		flags: number;
		color: number;
	})[];
	properties: {
		verification_level: number;
		vanity_url_code: string | null;
		system_channel_id: string | null;
		system_channel_flags: number;
		splash: string | null;
		safety_alerts_channel_id?: null;
		rules_channel_id: string | null;
		public_updates_channel_id: string | null;
		premium_tier: number;
		premium_progress_bar_enabled: boolean;
		preferred_locale: string;
		owner_id: string;
		nsfw_level: number;
		nsfw: boolean;
		name: string;
		mfa_level: number;
		max_video_channel_users: number;
		max_stage_video_channel_users: number;
		max_members: number;
		id: string;
		icon: string | null;
		hub_type: null;
		features: (string)[];
		explicit_content_filter: number;
		discovery_splash: string | null;
		description: string | null;
		default_message_notifications: number;
		banner: string | null;
		application_id: null;
		afk_timeout: number;
		afk_channel_id: string | null;
	};
	presences: ({
		user: {
			id: string;
		};
		status: string;
		client_status: {
			mobile?: string;
			desktop?: string;
			web?: string;
		};
		activities: ({
			type: number;
			state?: string;
			name: string;
			id: string;
			created_at: number;
			timestamps?: {
				start: number;
			};
		})[];
	})[];
	premium_subscription_count: number;
	members: ({
		user: {
			username: string;
			public_flags: number;
			id: string;
			discriminator: string;
			bot: boolean;
			avatar: string | null;
		};
		roles: (string)[];
		premium_since: null | string;
		pending: boolean;
		nick: null | string;
		mute: boolean;
		joined_at: string;
		flags: number;
		deaf: boolean;
		communication_disabled_until: null | string;
		avatar: null | string;
	})[];
	member_count: number;
	lazy: boolean;
	large: boolean;
	joined_at: string;
	id: string;
	guild_scheduled_events: ({
		status: number;
		sku_ids: [];
		scheduled_start_time: string;
		scheduled_end_time: null | string;
		privacy_level: number;
		name: string;
		image: string;
		id: string;
		guild_id: string;
		entity_type: number;
		entity_metadata: {
			speaker_ids?: [];
			location?: string;
		};
		entity_id: null;
		description: string;
		creator_id: string;
		channel_id: string | null;
	})[];
	emojis: ({
		roles: (string)[];
		require_colons: boolean;
		name: string;
		managed: boolean;
		id: string;
		available: boolean;
		animated: boolean;
	})[];
	embedded_activities: [];
	data_mode: string;
	channels: ({
		type: number;
		topic?: string | null;
		rate_limit_per_user?: number;
		position: number;
		permission_overwrites: ({
			type: number;
			id: string;
			deny: string;
			allow: string;
		})[];
		parent_id?: string | null;
		nsfw?: boolean;
		name: string;
		last_pin_timestamp?: string;
		last_message_id?: string | null;
		id: string;
		flags: number;
		default_thread_rate_limit_per_user?: number;
		template?: string;
		default_sort_order?: null;
		default_reaction_emoji?: null | {
			emoji_name: null | string;
			emoji_id: string | null;
		};
		default_forum_layout?: number;
		default_auto_archive_duration?: number;
		available_tags?: ({
			name: string;
			moderated: boolean;
			id: string;
			emoji_name: string | null;
			emoji_id: null | string | number;
		})[];
		user_limit?: number;
		rtc_region?: null | string;
		bitrate?: number;
		video_quality_mode?: number;
	})[];
	application_command_counts: {
		1?: number;
		2?: number;
		3?: number;
	};
}

export type GUILD_FEATURE_ACK = GUILD_FEATURE_ACK$;
interface GUILD_FEATURE_ACK$ {
	version: number;
	resource_id: string;
	entity_id: string;
	ack_type: number;
}

export type GUILD_INTEGRATIONS_UPDATE = GUILD_INTEGRATIONS_UPDATE$;
interface GUILD_INTEGRATIONS_UPDATE$ {
	guild_id: string;
}

export type GUILD_JOIN_REQUEST_CREATE = GUILD_JOIN_REQUEST_CREATE$;
interface GUILD_JOIN_REQUEST_CREATE$ {
	status: string;
	request: {
		user_id: string;
		rejection_reason: null;
		last_seen: null;
		id: string;
		guild_id: string;
		created_at: string;
		application_status: string;
	};
	guild_id: string;
}

export type GUILD_JOIN_REQUEST_UPDATE = GUILD_JOIN_REQUEST_UPDATE$;
interface GUILD_JOIN_REQUEST_UPDATE$ {
	status: string;
	request: {
		user_id: string;
		rejection_reason: null;
		last_seen: string;
		id: string;
		guild_id: string;
		created_at: string;
		application_status: string;
	};
	guild_id: string;
}

export type GUILD_MEMBER_UPDATE = GUILD_MEMBER_UPDATE$;
interface GUILD_MEMBER_UPDATE$ {
	user: {
		username: string;
		public_flags: number;
		id: string;
		discriminator: string;
		avatar_decoration?: null;
		avatar: string;
		bot?: boolean;
	};
	roles: (string)[];
	premium_since: null | string;
	pending: boolean;
	nick: null | string;
	joined_at: string;
	is_pending?: boolean;
	guild_id: string;
	flags: number;
	communication_disabled_until: null | string;
	avatar: null | string;
	mute?: boolean;
	deaf?: boolean;
}

export type GUILD_ROLE_CREATE = GUILD_ROLE_CREATE$;
interface GUILD_ROLE_CREATE$ {
	role: {
		version: number;
		unicode_emoji: null;
		position: number;
		permissions: string;
		name: string;
		mentionable: boolean;
		managed: boolean;
		id: string;
		icon: null;
		hoist: boolean;
		flags: number;
		description: null;
		color: number;
	};
	hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	guild_id: string;
	guild_hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
}

export type GUILD_ROLE_DELETE = GUILD_ROLE_DELETE$;
interface GUILD_ROLE_DELETE$ {
	version: number;
	role_id: string;
	hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	guild_id: string;
	guild_hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
}

export type GUILD_ROLE_UPDATE = GUILD_ROLE_UPDATE$;
interface GUILD_ROLE_UPDATE$ {
	role: {
		version: number;
		unicode_emoji: null;
		position: number;
		permissions: string;
		name: string;
		mentionable: boolean;
		managed: boolean;
		id: string;
		icon: string;
		hoist: boolean;
		flags: number;
		description: null;
		color: number;
	};
	hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	guild_id: string;
	guild_hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
}

export type GUILD_SCHEDULED_EVENT_USER_ADD = GUILD_SCHEDULED_EVENT_USER_ADD$;
interface GUILD_SCHEDULED_EVENT_USER_ADD$ {
	user_id: string;
	guild_scheduled_event_id: string;
	guild_id: string;
}

export type GUILD_UPDATE = GUILD_UPDATE$;
interface GUILD_UPDATE$ {
	id: string;
	verification_level: number;
	preferred_locale: string;
	afk_channel_id: null | string;
	vanity_url_code: null | string;
	splash: null | string;
	icon: null | string;
	widget_enabled: boolean;
	rules_channel_id: null | string;
	premium_tier: number;
	nsfw: boolean;
	system_channel_flags: number;
	system_channel_id: null | string;
	version: number;
	max_members: number;
	afk_timeout: number;
	application_id: null;
	hub_type: null;
	banner: null | string;
	nsfw_level: number;
	max_stage_video_channel_users: number;
	max_video_channel_users: number;
	premium_subscription_count: number;
	region: string;
	features: (string)[];
	premium_progress_bar_enabled: boolean;
	hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	guild_hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	safety_alerts_channel_id: null;
	description: null | string;
	roles: ({
		version: number;
		unicode_emoji: null | string;
		position: number;
		permissions: string;
		name: string;
		mentionable: boolean;
		managed: boolean;
		id: string;
		icon: null | string;
		hoist: boolean;
		flags: number;
		description: null;
		color: number;
		tags?: {
			premium_subscriber?: null;
			bot_id?: string;
			integration_id?: string;
		};
	})[];
	guild_id: string;
	owner_id: string;
	emojis: ({
		version: number;
		roles: (string)[];
		require_colons: boolean;
		name: string;
		managed: boolean;
		id: string;
		available: boolean;
		animated: boolean;
	})[];
	public_updates_channel_id: null | string;
	widget_channel_id: null;
	stickers: ({
		version: number;
		type: number;
		tags: string;
		name: string;
		id: string;
		guild_id: string;
		format_type: number;
		description: string;
		available: boolean;
		asset: string;
	})[];
	discovery_splash: null | string;
	explicit_content_filter: number;
	default_message_notifications: number;
	mfa_level: number;
	name: string;
	max_presences: null;
}

export type INTEGRATION_UPDATE = INTEGRATION_UPDATE$;
interface INTEGRATION_UPDATE$ {
	user: {
		username: string;
		public_flags: number;
		id: string;
		discriminator: string;
		avatar_decoration: null;
		avatar: string;
	};
	type: string;
	syncing: boolean;
	synced_at: string;
	subscriber_count: number;
	role_id: string;
	revoked: boolean;
	name: string;
	id: string;
	hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	guild_hashes: {
		version: number;
		roles: {
			hash: string;
		};
		metadata: {
			hash: string;
		};
		channels: {
			hash: string;
		};
	};
	expire_grace_period: number;
	expire_behavior: number;
	enabled: boolean;
	enable_emoticons: boolean;
	account: {
		name: string;
		id: string;
	};
	guild_id: string;
}

export type INTERACTION_CREATE = INTERACTION_CREATE$;
interface INTERACTION_CREATE$ {
	nonce: string;
	id: string;
}

export type INTERACTION_SUCCESS = INTERACTION_SUCCESS$;
interface INTERACTION_SUCCESS$ {
	nonce: string;
	id: string;
}

export type INVITE_CREATE = INVITE_CREATE$;
interface INVITE_CREATE$ {
	uses: number;
	type: number;
	temporary: boolean;
	max_uses: number;
	max_age: number;
	inviter: {
		username: string;
		public_flags: number;
		id: string;
		discriminator: string;
		avatar_decoration: null;
		avatar: string;
	};
	guild_id: string;
	expires_at: string;
	created_at: string;
	code: string;
	channel_id: string;
}

export type MESSAGE_ACK = MESSAGE_ACK$;
interface MESSAGE_ACK$ {
	version: number;
	message_id: string;
	channel_id: string;
	ack_type?: number;
}

export type MESSAGE_CREATE = MESSAGE_CREATE$;
interface MESSAGE_CREATE$ {
	type: number;
	tts: boolean;
	timestamp: string;
	referenced_message?: null | {
		type: number;
		tts: boolean;
		timestamp: string;
		pinned: boolean;
		mentions: ({
			username: string;
			public_flags: number;
			id: string;
			discriminator: string;
			avatar_decoration: null;
			avatar: string | null;
			bot?: boolean;
		})[];
		mention_roles: (string)[];
		mention_everyone: boolean;
		id: string;
		flags: number;
		embeds: ({
			url?: string;
			type: string;
			title?: string;
			image?: {
				width: number;
				url: string;
				proxy_url: string;
				height: number;
			};
			description?: string;
			color?: number;
			author?: {
				name: string;
				url?: string;
				proxy_icon_url?: string;
				icon_url?: string;
			};
			thumbnail?: {
				width: number;
				url: string;
				proxy_url: string;
				height: number;
			};
			footer?: {
				text: string;
				proxy_icon_url?: string;
				icon_url?: string;
			};
			video?: {
				width: number;
				url: string;
				proxy_url?: string;
				height: number;
			};
			reference_id?: string;
			provider?: {
				url?: string;
				name: string;
			};
			timestamp?: string;
			fields?: ({
				value: string;
				name: string;
				inline: boolean;
			})[];
		})[];
		edited_timestamp: null | string;
		content: string;
		components: ({
			type: number;
			components: ({
				type: number;
				style?: number;
				emoji?: {
					name: string;
					id?: string;
				};
				custom_id: string;
				placeholder?: string;
				options?: ({
					value: string;
					label: string;
					emoji: {
						name: string;
						id: string;
					};
					description: string;
				})[];
				min_values?: number;
				max_values?: number;
			})[];
		})[];
		channel_id: string;
		author: {
			username: string;
			public_flags?: number;
			id: string;
			discriminator: string;
			avatar_decoration?: null;
			avatar: string | null;
			bot?: boolean;
		};
		attachments: ({
			width?: number;
			url: string;
			size: number;
			proxy_url: string;
			id: string;
			height?: number;
			filename: string;
			content_type?: string;
		})[];
		message_reference?: {
			message_id: string;
			guild_id: string;
			channel_id: string;
		};
		sticker_items?: ({
			name: string;
			id: string;
			format_type: number;
		})[];
		webhook_id?: string;
		application_id?: string;
		thread?: {
			type: number;
			total_message_sent: number;
			thread_metadata: {
				locked: boolean;
				create_timestamp: string;
				auto_archive_duration: number;
				archived: boolean;
				archive_timestamp: string;
			};
			rate_limit_per_user: number;
			parent_id: string;
			owner_id: string;
			name: string;
			message_count: number;
			member_ids_preview: (string)[];
			member_count: number;
			last_message_id: string;
			id: string;
			guild_id: string;
			flags: number;
		};
	};
	pinned: boolean;
	nonce?: string;
	message_reference?: {
		message_id?: string;
		guild_id?: string;
		channel_id: string;
	};
	mentions: ({
		username: string;
		public_flags: number;
		member?: {
			roles: (string)[];
			premium_since: null | string;
			pending: boolean;
			nick: null | string;
			mute: boolean;
			joined_at: string;
			flags: number;
			deaf: boolean;
			communication_disabled_until: null | string;
			avatar: null | string;
		};
		id: string;
		discriminator: string;
		avatar_decoration: null;
		avatar: string | null;
		bot?: boolean;
	})[];
	mention_roles: (string)[];
	mention_everyone: boolean;
	member?: {
		roles: (string)[];
		premium_since: null | string;
		pending: boolean;
		nick: string | null;
		mute: boolean;
		joined_at: string;
		flags: number;
		deaf: boolean;
		communication_disabled_until: null | string;
		avatar: string | null;
	};
	id: string;
	flags: number;
	embeds: ({
		type: string;
		description?: string;
		color?: number;
		author?: {
			proxy_icon_url?: string;
			name: string;
			icon_url?: string;
			url?: string;
		};
		thumbnail?: {
			width: number;
			url: string;
			proxy_url: string;
			height: number;
		};
		image?: {
			width: number;
			url: string;
			proxy_url: string;
			height: number;
		};
		footer?: {
			text: string;
			proxy_icon_url?: string;
			icon_url?: string;
		};
		title?: string;
		fields?: ({
			value: string;
			name: string;
			inline: boolean;
		})[];
		url?: string;
		timestamp?: string;
		video?: {
			width: number;
			url: string;
			proxy_url?: string;
			height: number;
		};
		provider?: {
			url?: string;
			name: string;
		};
		reference_id?: string;
	})[];
	edited_timestamp: null;
	content: string;
	components: ({
		type: number;
		components: ({
			type: number;
			style?: number;
			label?: string;
			emoji?: {
				name: string;
				id?: string;
				animated?: boolean;
			};
			custom_id?: string;
			disabled?: boolean;
			url?: string;
			placeholder?: string;
			options?: ({
				value: string;
				label: string;
				emoji?: {
					name: string;
					id?: string;
				};
				description?: string;
				default?: boolean;
			})[];
			min_values?: number;
			max_values?: number;
		})[];
	})[];
	channel_id: string;
	author: {
		username: string;
		public_flags?: number;
		id: string;
		discriminator: string;
		avatar_decoration?: null | string;
		avatar: string | null;
		bot?: boolean;
	};
	attachments: ({
		width?: number;
		url: string;
		size: number;
		proxy_url: string;
		id: string;
		height?: number;
		filename: string;
		content_type?: string;
		description?: string;
	})[];
	guild_id?: string;
	sticker_items?: ({
		name: string;
		id: string;
		format_type: number;
	})[];
	webhook_id?: string;
	application_id?: string;
	interaction?: {
		user: {
			username: string;
			public_flags: number;
			id: string;
			discriminator: string;
			avatar_decoration: null;
			avatar: string;
		};
		type: number;
		name: string;
		member: {
			roles: (string)[];
			premium_since: null;
			pending: boolean;
			nick: string | null;
			mute: boolean;
			joined_at: string;
			flags: number;
			deaf: boolean;
			communication_disabled_until: null;
			avatar: null;
		};
		id: string;
	};
	activity?: {
		type: number;
		party_id: string;
	};
	call?: {
		participants: (string)[];
		ended_timestamp: null;
	};
}

export type MESSAGE_DELETE = MESSAGE_DELETE$;
interface MESSAGE_DELETE$ {
	id: string;
	channel_id: string;
	guild_id?: string;
}

export type MESSAGE_DELETE_BULK = MESSAGE_DELETE_BULK$;
interface MESSAGE_DELETE_BULK$ {
	ids: (string)[];
	channel_id: string;
	guild_id: string;
}

export type MESSAGE_REACTION_ADD = MESSAGE_REACTION_ADD$;
interface MESSAGE_REACTION_ADD$ {
	user_id: string;
	message_id: string;
	member: {
		user: {
			username: string;
			public_flags: number;
			id: string;
			discriminator: string;
			bot: boolean;
			avatar: string | null;
		};
		roles: (string)[];
		premium_since: null | string;
		pending: boolean;
		nick: string | null;
		mute: boolean;
		joined_at: string;
		flags: number;
		deaf: boolean;
		communication_disabled_until: null | string;
		avatar: string | null;
	};
	emoji: {
		name: string;
		id: null | string;
		animated?: boolean;
	};
	channel_id: string;
	burst: boolean;
	guild_id: string;
}

export type MESSAGE_REACTION_REMOVE = MESSAGE_REACTION_REMOVE$;
interface MESSAGE_REACTION_REMOVE$ {
	user_id: string;
	message_id: string;
	emoji: {
		name: string;
		id: null | string;
	};
	channel_id: string;
	burst: boolean;
	guild_id: string;
}

export type MESSAGE_REACTION_REMOVE_ALL = MESSAGE_REACTION_REMOVE_ALL$;
interface MESSAGE_REACTION_REMOVE_ALL$ {
	message_id: string;
	channel_id: string;
	burst: boolean;
	guild_id: string;
}

export type MESSAGE_REACTION_REMOVE_EMOJI = MESSAGE_REACTION_REMOVE_EMOJI$;
interface MESSAGE_REACTION_REMOVE_EMOJI$ {
	message_id: string;
	emoji: {
		name: string;
		id: string;
	};
	channel_id: string;
	burst: boolean;
	guild_id: string;
}

export type MESSAGE_UPDATE = MESSAGE_UPDATE$;
interface MESSAGE_UPDATE$ {
	type?: number;
	tts?: boolean;
	timestamp?: string;
	pinned?: boolean;
	mentions?: ({
		username: string;
		public_flags: number;
		member: {
			roles: (string)[];
			premium_since: null | string;
			pending: boolean;
			nick: null | string;
			mute: boolean;
			joined_at: string;
			flags: number;
			deaf: boolean;
			communication_disabled_until: null | string;
			avatar: null | string;
		};
		id: string;
		discriminator: string;
		avatar_decoration: null;
		avatar: string | null;
		bot?: boolean;
	})[];
	mention_roles?: (string)[];
	mention_everyone?: boolean;
	member?: {
		roles: (string)[];
		premium_since: null | string;
		pending: boolean;
		nick: null | string;
		mute: boolean;
		joined_at: string;
		flags: number;
		deaf: boolean;
		communication_disabled_until: null | string;
		avatar: null | string;
	};
	id: string;
	flags?: number;
	embeds?: ({
		url?: string;
		type: string;
		title?: string;
		image?: {
			width: number;
			url: string;
			proxy_url: string;
			height: number;
		};
		description?: string;
		color?: number;
		author?: {
			name: string;
			proxy_icon_url?: string;
			icon_url?: string;
			url?: string;
		};
		footer?: {
			text: string;
			proxy_icon_url?: string;
			icon_url?: string;
		};
		fields?: ({
			value: string;
			name: string;
			inline: boolean;
		})[];
		thumbnail?: {
			width: number;
			url: string;
			proxy_url: string;
			height: number;
		};
		provider?: {
			name: string;
			url?: string;
		};
		video?: {
			width: number;
			url: string;
			height: number;
			proxy_url?: string;
		};
		timestamp?: string;
		reference_id?: string;
	})[];
	edited_timestamp?: null | string;
	content?: string;
	components?: ({
		type: number;
		components: ({
			type: number;
			style?: number;
			emoji?: {
				name: string;
				id?: string;
				animated?: boolean;
			};
			custom_id: string;
			placeholder?: string;
			options?: ({
				value: string;
				label: string;
				emoji?: {
					name: string;
					id?: string;
				};
				description?: string;
				default?: boolean;
			})[];
			min_values?: number;
			max_values?: number;
			disabled?: boolean;
			label?: string;
		})[];
	})[];
	channel_id: string;
	author?: {
		username: string;
		public_flags?: number;
		id: string;
		discriminator: string;
		avatar_decoration?: null;
		avatar: string | null;
		bot?: boolean;
	};
	attachments?: ({
		width?: number;
		url: string;
		size: number;
		proxy_url: string;
		id: string;
		height?: number;
		filename: string;
		content_type: string;
		description?: string;
	})[];
	guild_id?: string;
	referenced_message?: null | {
		type: number;
		tts: boolean;
		timestamp: string;
		pinned: boolean;
		message_reference?: {
			message_id: string;
			guild_id: string;
			channel_id: string;
		};
		mentions: ({
			username: string;
			public_flags: number;
			id: string;
			discriminator: string;
			avatar_decoration: null;
			avatar: string | null;
			bot?: boolean;
		})[];
		mention_roles: [];
		mention_everyone: boolean;
		id: string;
		flags: number;
		embeds: ({
			video?: {
				width: number;
				url: string;
				height: number;
				proxy_url?: string;
			};
			url?: string;
			type: string;
			title?: string;
			thumbnail?: {
				width: number;
				url: string;
				proxy_url: string;
				height: number;
			};
			provider?: {
				url?: string;
				name: string;
			};
			description?: string;
			color?: number;
			author?: {
				url?: string;
				name: string;
			};
			reference_id?: string;
			image?: {
				width: number;
				url: string;
				proxy_url: string;
				height: number;
			};
			fields?: ({
				value: string;
				name: string;
				inline: boolean;
			})[];
			footer?: {
				text: string;
			};
		})[];
		edited_timestamp: null | string;
		content: string;
		components: [];
		channel_id: string;
		author: {
			username: string;
			public_flags?: number;
			id: string;
			discriminator: string;
			avatar_decoration?: null;
			avatar: string | null;
			bot?: boolean;
		};
		attachments: ({
			width?: number;
			url: string;
			size: number;
			proxy_url: string;
			id: string;
			height?: number;
			filename: string;
			content_type?: string;
		})[];
		webhook_id?: string;
		application_id?: string;
	};
	message_reference?: {
		message_id: string;
		guild_id: string;
		channel_id: string;
	};
	webhook_id?: string;
	application_id?: string;
	interaction?: {
		user: {
			username: string;
			public_flags: number;
			id: string;
			discriminator: string;
			avatar_decoration: null;
			avatar: string;
		};
		type: number;
		name: string;
		member: {
			roles: (string)[];
			premium_since: null;
			pending: boolean;
			nick: string;
			mute: boolean;
			joined_at: string;
			flags: number;
			deaf: boolean;
			communication_disabled_until: null;
			avatar: null;
		};
		id: string;
	};
	call?: {
		participants: (string)[];
		ended_timestamp: null | string;
	};
}

export type NOTIFICATION_CENTER_ITEM_CREATE = NOTIFICATION_CENTER_ITEM_CREATE$;
interface NOTIFICATION_CENTER_ITEM_CREATE$ {
	type: string;
	other_user: {
		username: string;
		public_flags: number;
		id: string;
		discriminator: string;
		avatar_decoration: null;
		avatar: string;
	};
	item_enum: null;
	id: string;
	icon_url: string;
	deeplink: string;
	completed: boolean;
	bundle_id: string;
	body: string;
	acked: boolean;
}

export type OAUTH2_TOKEN_REVOKE = OAUTH2_TOKEN_REVOKE$;
interface OAUTH2_TOKEN_REVOKE$ {
	access_token: string;
}

export type PASSIVE_UPDATE_V1 = PASSIVE_UPDATE_V1$;
interface PASSIVE_UPDATE_V1$ {
	guild_id: string;
	channels: ({
		last_pin_timestamp?: string;
		last_message_id: string;
		id: string;
	})[];
	voice_states?: ({
		user_id: string;
		suppress: boolean;
		session_id: string;
		self_video: boolean;
		self_mute: boolean;
		self_deaf: boolean;
		request_to_speak_timestamp: null;
		mute: boolean;
		deaf: boolean;
		channel_id: string;
		self_stream?: boolean;
	})[];
	members?: ({
		user: {
			username: string;
			public_flags: number;
			id: string;
			discriminator: string;
			bot: boolean;
			avatar: string | null;
		};
		roles: (string)[];
		premium_since: null | string;
		pending: boolean;
		nick: string | null;
		mute: boolean;
		joined_at: string;
		flags: number;
		deaf: boolean;
		communication_disabled_until: null | string;
		avatar: null | string;
	})[];
}

export type PRESENCE_UPDATE = PRESENCE_UPDATE$;
interface PRESENCE_UPDATE$ {
	user: {
		id: string;
		username?: string;
		public_flags?: number;
		discriminator?: string;
		avatar?: string;
		bot?: boolean;
	};
	status: string;
	guild_id?: string;
	client_status: {
		mobile?: string;
		desktop?: string;
		web?: string;
	};
	activities: ({
		type: number;
		state?: string;
		name: string;
		id: string;
		created_at: number;
		timestamps?: {
			start: number;
			end?: number;
		};
		details?: string;
		assets?: {
			small_text?: string;
			small_image?: string;
			large_text?: string;
			large_image?: string;
		};
		application_id?: string;
		url?: string;
		session_id?: string;
		flags?: number;
		buttons?: (string)[];
		sync_id?: string;
		party?: {
			id?: string;
			size?: (number)[];
		};
	})[];
	last_modified?: number;
}

export type READY = READY$;
interface READY$ {
	v: number;
	users: ({
		username: string;
		public_flags: number;
		id: string;
		discriminator: string;
		avatar_decoration?: null;
		avatar: string | null;
		bot?: boolean;
	})[];
	user_settings_proto: string;
	user_guild_settings: {
		version: number;
		partial: boolean;
		entries: ({
			version: number;
			suppress_roles: boolean;
			suppress_everyone: boolean;
			notify_highlights: number;
			muted: boolean;
			mute_scheduled_events: boolean;
			mute_config: null;
			mobile_push: boolean;
			message_notifications: number;
			hide_muted_channels: boolean;
			guild_id: string | null;
			flags: number;
			channel_overrides: ({
				muted: boolean;
				mute_config: null;
				message_notifications: number;
				collapsed: boolean;
				channel_id: string;
				flags?: number;
			})[];
		})[];
	};
	user: {
		verified: boolean;
		username: string;
		purchased_flags: number;
		premium_type: number;
		premium: boolean;
		phone: null | string;
		nsfw_allowed: boolean;
		mobile: boolean;
		mfa_enabled: boolean;
		id: string;
		flags: number;
		email: string;
		discriminator: string;
		desktop: boolean;
		bio: string;
		banner_color: null;
		banner: null;
		avatar_decoration: null;
		avatar: string;
		accent_color: null;
		public_flags?: number;
	};
	tutorial: null;
	sessions: ({
		status: string;
		session_id: string;
		client_info: {
			version: number;
			os: string;
			client: string;
		};
		activities: ({
			type: number;
			state: string;
			name: string;
			id: string;
			created_at: number;
		})[];
		active?: boolean;
	})[];
	session_type: string;
	session_id: string;
	resume_gateway_url: string;
	relationships: ({
		user_id: string;
		type: number;
		nickname: null;
		id: string;
		since?: string;
	})[];
	read_state: {
		version: number;
		partial: boolean;
		entries: ({
			mention_count?: number;
			last_pin_timestamp?: string;
			last_message_id?: string | number;
			id: string;
			read_state_type?: number;
			last_acked_id?: number | string;
			badge_count?: number;
		})[];
	};
	private_channels: ({
		type: number;
		recipient_ids: (string)[];
		last_message_id: string | null;
		id: string;
		flags: number;
		owner_id?: string;
		name?: null | string;
		icon?: null | string;
		is_message_request_timestamp?: string;
		is_message_request?: boolean;
		last_pin_timestamp?: string;
	})[];
	merged_members: (({
		user_id: string;
		roles: (string)[];
		premium_since: null;
		pending: boolean;
		nick: null | string;
		mute: boolean;
		joined_at: string;
		flags: number;
		deaf: boolean;
		communication_disabled_until: null | string;
		avatar: null;
	})[])[];
	guilds: ({
		version: number;
		threads: ({
			type: number;
			total_message_sent: number;
			thread_metadata: {
				locked: boolean;
				create_timestamp: string;
				auto_archive_duration: number;
				archived: boolean;
				archive_timestamp: string;
			};
			rate_limit_per_user: number;
			parent_id: string;
			owner_id: string;
			name: string;
			message_count: number;
			member_ids_preview: (string)[];
			member_count: number;
			member: {
				muted: boolean;
				mute_config: null;
				join_timestamp: string;
				flags: number;
			};
			last_message_id: string;
			id: string;
			guild_id: string;
			flags: number;
			applied_tags: (string)[];
		})[];
		stickers: ({
			type: number;
			tags: string;
			name: string;
			id: string;
			guild_id: string;
			format_type: number;
			description: string | null;
			available: boolean;
			asset?: string;
		})[];
		stage_instances: [];
		roles: ({
			unicode_emoji: null | string;
			tags: {
				bot_id?: string;
				premium_subscriber?: null;
				integration_id?: string;
				subscription_listing_id?: string;
				available_for_purchase?: null;
			};
			position: number;
			permissions: string;
			name: string;
			mentionable: boolean;
			managed: boolean;
			id: string;
			icon: null | string;
			hoist: boolean;
			flags: number;
			color: number;
		})[];
		properties: {
			verification_level: number;
			vanity_url_code: string | null;
			system_channel_id: string | null;
			system_channel_flags: number;
			splash: string | null;
			safety_alerts_channel_id?: null;
			rules_channel_id: string | null;
			public_updates_channel_id: string | null;
			premium_tier: number;
			premium_progress_bar_enabled: boolean;
			preferred_locale: string;
			owner_id: string;
			nsfw_level: number;
			nsfw: boolean;
			name: string;
			mfa_level: number;
			max_video_channel_users: number;
			max_stage_video_channel_users: number;
			max_members: number;
			id: string;
			icon: string | null;
			hub_type: null;
			features: (string)[];
			explicit_content_filter: number;
			discovery_splash: string | null;
			description: string | null;
			default_message_notifications: number;
			banner: string | null;
			application_id: null;
			afk_timeout: number;
			afk_channel_id: null | string;
		};
		premium_subscription_count: number;
		member_count: number;
		lazy: boolean;
		large: boolean;
		joined_at: string;
		id: string;
		guild_scheduled_events: ({
			status: number;
			sku_ids: [];
			scheduled_start_time: string;
			scheduled_end_time: null | string;
			privacy_level: number;
			name: string;
			image: string;
			id: string;
			guild_id: string;
			entity_type: number;
			entity_metadata: {
				speaker_ids?: [];
				location?: string;
			};
			entity_id: null;
			description: string;
			creator_id: string;
			channel_id: string | null;
		})[];
		emojis: ({
			roles: (string)[];
			require_colons: boolean;
			name: string;
			managed: boolean;
			id: string;
			available: boolean;
			animated: boolean;
		})[];
		data_mode: string;
		channels: ({
			type: number;
			topic?: null | string;
			rate_limit_per_user?: number;
			position: number;
			permission_overwrites: ({
				type: number;
				id: string;
				deny: string;
				allow: string;
			})[];
			parent_id?: string | null;
			name: string;
			last_message_id?: string | null;
			id: string;
			flags: number;
			nsfw?: boolean;
			last_pin_timestamp?: string;
			user_limit?: number;
			rtc_region?: null | string;
			bitrate?: number;
			default_auto_archive_duration?: number;
			default_thread_rate_limit_per_user?: number;
			template?: string;
			default_sort_order?: null;
			default_reaction_emoji?: null | {
				emoji_name: null | string;
				emoji_id: string | null;
			};
			default_forum_layout?: number;
			available_tags?: ({
				name: string;
				moderated: boolean;
				id: string;
				emoji_name: null | string;
				emoji_id: string | null | number;
			})[];
			video_quality_mode?: number;
		})[];
		application_command_counts: {
			1?: number;
			2?: number;
			3?: number;
		};
	})[];
	guild_join_requests: ({
		user_id: string;
		rejection_reason: null;
		last_seen: null;
		id: string;
		guild_id: string;
		created_at: string;
		application_status: string;
	})[];
	guild_experiments: ((number | null | string | ({
		k: (string)[];
		b: number;
	} | (((number | (number | {
		s: number;
		e: number;
	} | (number | null | {
		s: number;
		e: number;
	} | (number | string | (string)[])[])[])[])[])[])[])[])[])[];
	geo_ordered_rtc_regions: (string)[];
	friend_suggestion_count: number;
	experiments: ((number)[])[];
	country_code: string;
	consents: {
		personalization: {
			consented: boolean;
		};
	};
	connected_accounts: [];
	auth_session_id_hash: string;
	api_code_version: number;
	analytics_token: string;
	_trace: (string)[];
}

export type READY_SUPPLEMENTAL = READY_SUPPLEMENTAL$;
interface READY_SUPPLEMENTAL$ {
	merged_presences: {
		guilds: (({
			user_id: string;
			status: string;
			client_status: {
				mobile?: string;
				desktop?: string;
				web?: string;
			};
			activities: ({
				type: number;
				state?: string;
				name: string;
				id: string;
				created_at: number;
				timestamps?: {
					start: number;
				};
				details?: string;
				assets?: {
					small_text?: string;
					small_image?: string;
					large_text?: string;
					large_image: string;
				};
				application_id?: string;
				session_id?: string;
				party?: {
					size: (number)[];
					id: string;
				};
				flags?: number;
				buttons?: (string)[];
			})[];
		})[])[];
		friends: ({
			user_id: string;
			status: string;
			last_modified: number;
			client_status: {
				web?: string;
				mobile?: string;
				desktop?: string;
			};
			activities: ({
				type: number;
				timestamps?: {
					start: number;
				};
				state?: string;
				session_id?: string;
				name: string;
				id: string;
				flags?: number;
				details?: string;
				created_at: number;
				buttons?: (string)[];
				assets?: {
					small_text?: string;
					small_image?: string;
					large_text?: string;
					large_image: string;
				};
				application_id?: string;
				party?: {
					size: (number)[];
					id: string;
				};
			})[];
		})[];
	};
	merged_members: (({
		user_id: string;
		roles: (string)[];
		premium_since: null | string;
		pending: boolean;
		nick: null | string;
		mute: boolean;
		joined_at: string;
		flags: number;
		deaf: boolean;
		communication_disabled_until: null | string;
		avatar: null | string;
	})[])[];
	lazy_private_channels: [];
	guilds: ({
		voice_states: ({
			user_id: string;
			suppress: boolean;
			session_id: string;
			self_video: boolean;
			self_mute: boolean;
			self_deaf: boolean;
			request_to_speak_timestamp: null;
			mute: boolean;
			deaf: boolean;
			channel_id: string;
			self_stream?: boolean;
		})[];
		id: string;
		embedded_activities: ({
			users: (string)[];
			update_code: number;
			embedded_activity: {
				type: null;
				timestamps: null;
				state: null;
				secrets: null;
				name: string;
				details: null;
				created_at: null;
				assets: null;
				application_id: string;
				activity_id: string;
			};
			connections: ({
				user_id: string;
				metadata: {
					is_eligible_host: boolean;
				};
			})[];
			channel_id: string;
		})[];
	})[];
}

export type RELATIONSHIP_ADD = RELATIONSHIP_ADD$;
interface RELATIONSHIP_ADD$ {
	user: {
		username: string;
		public_flags: number;
		id: string;
		discriminator: string;
		avatar_decoration: null;
		avatar: string;
	};
	type: number;
	nickname: null;
	id: string;
	should_notify?: boolean;
	since?: string;
}

export type RELATIONSHIP_REMOVE = RELATIONSHIP_REMOVE$;
interface RELATIONSHIP_REMOVE$ {
	type: number;
	nickname: null;
	id: string;
}

export type RELATIONSHIP_UPDATE = RELATIONSHIP_UPDATE$;
interface RELATIONSHIP_UPDATE$ {
	type: number;
	nickname: string | null;
	id: string;
}

export type RESUMED = RESUMED$;
interface RESUMED$ {
	_trace: (string)[];
}

export type SESSIONS_REPLACE = SESSIONS_REPLACE$$;
type SESSIONS_REPLACE$$ = ({
	status: string;
	session_id: string;
	client_info: {
		version: number;
		os: string;
		client: string;
	};
	activities: ({
		type: number;
		state: string;
		name: string;
		id: string;
		created_at: number;
	})[];
	active?: boolean;
})[];

export type STAGE_INSTANCE_CREATE = STAGE_INSTANCE_CREATE$;
interface STAGE_INSTANCE_CREATE$ {
	topic: string;
	privacy_level: number;
	invite_code: null;
	id: string;
	guild_scheduled_event_id: string;
	guild_id: string;
	discoverable_disabled: boolean;
	channel_id: string;
}

export type STAGE_INSTANCE_DELETE = STAGE_INSTANCE_DELETE$;
interface STAGE_INSTANCE_DELETE$ {
	topic: string;
	privacy_level: number;
	invite_code: null;
	id: string;
	guild_scheduled_event_id: string;
	guild_id: string;
	discoverable_disabled: boolean;
	channel_id: string;
}

export type THREAD_CREATE = THREAD_CREATE$;
interface THREAD_CREATE$ {
	type: number;
	total_message_sent: number;
	thread_metadata: {
		locked: boolean;
		create_timestamp: string;
		auto_archive_duration: number;
		archived: boolean;
		archive_timestamp: string;
	};
	rate_limit_per_user: number;
	parent_id: string;
	owner_id: string;
	newly_created: boolean;
	name: string;
	message_count: number;
	member_ids_preview: (string)[];
	member_count: number;
	last_message_id: null;
	id: string;
	guild_id: string;
	flags: number;
	applied_tags?: (string)[];
}

export type THREAD_DELETE = THREAD_DELETE$;
interface THREAD_DELETE$ {
	type: number;
	parent_id: string;
	id: string;
	guild_id: string;
}

export type THREAD_UPDATE = THREAD_UPDATE$;
interface THREAD_UPDATE$ {
	type: number;
	total_message_sent: number;
	thread_metadata: {
		locked: boolean;
		create_timestamp: string;
		auto_archive_duration: number;
		archived: boolean;
		archive_timestamp: string;
	};
	rate_limit_per_user: number;
	parent_id: string;
	owner_id: string;
	name: string;
	message_count: number;
	member_ids_preview: (string)[];
	member_count: number;
	last_message_id: string;
	id: string;
	guild_id: string;
	flags: number;
	applied_tags?: (string)[];
}

export type TYPING_START = TYPING_START$;
interface TYPING_START$ {
	user_id: string;
	timestamp: number;
	channel_id: string;
}

export type USER_CONNECTIONS_UPDATE = USER_CONNECTIONS_UPDATE$;
interface USER_CONNECTIONS_UPDATE$ {
	user_id?: string;
	visibility?: number;
	verified?: boolean;
	type?: string;
	two_way_link?: boolean;
	show_activity?: boolean;
	revoked?: boolean;
	name?: string;
	metadata_visibility?: number;
	id?: string;
	friend_sync?: boolean;
}

export type USER_GUILD_SETTINGS_UPDATE = USER_GUILD_SETTINGS_UPDATE$;
interface USER_GUILD_SETTINGS_UPDATE$ {
	version: number;
	suppress_roles: boolean;
	suppress_everyone: boolean;
	notify_highlights: number;
	muted: boolean;
	mute_scheduled_events: boolean;
	mute_config: null | {
		selected_time_window: number;
		end_time: null;
	};
	mobile_push: boolean;
	message_notifications: number;
	hide_muted_channels: boolean;
	guild_id: string | null;
	flags: number;
	channel_overrides: ({
		muted: boolean;
		mute_config: null | {
			selected_time_window: number;
			end_time: null;
		};
		message_notifications: number;
		flags?: number;
		collapsed: boolean;
		channel_id: string;
	})[];
}

export type USER_NOTE_UPDATE = USER_NOTE_UPDATE$;
interface USER_NOTE_UPDATE$ {
	note: string;
	id: string;
}

export type USER_REQUIRED_ACTION_UPDATE = USER_REQUIRED_ACTION_UPDATE$;
interface USER_REQUIRED_ACTION_UPDATE$ {
	required_action: string | null;
}

export type USER_SETTINGS_PROTO_UPDATE = USER_SETTINGS_PROTO_UPDATE$;
interface USER_SETTINGS_PROTO_UPDATE$ {
	settings: {
		type: number;
		proto: string;
	};
	partial: boolean;
}

export type USER_UPDATE = USER_UPDATE$;
interface USER_UPDATE$ {
	verified: boolean;
	username: string;
	public_flags: number;
	phone: null | string;
	nsfw_allowed: boolean;
	mfa_enabled: boolean;
	locale: string;
	id: string;
	flags: number;
	email: string;
	discriminator: string;
	bio: string;
	banner_color: null;
	banner: null;
	avatar_decoration: null;
	avatar: string;
	accent_color: null;
}

export type VOICE_STATE_UPDATE = VOICE_STATE_UPDATE$;
interface VOICE_STATE_UPDATE$ {
	member?: {
		user: {
			username: string;
			public_flags: number;
			id: string;
			discriminator: string;
			bot: boolean;
			avatar: string | null;
		};
		roles: (string)[];
		premium_since: null | string;
		pending: boolean;
		nick: null | string;
		mute: boolean;
		joined_at: string;
		flags: number;
		deaf: boolean;
		communication_disabled_until: null | string;
		avatar: null | string;
	};
	user_id: string;
	suppress: boolean;
	session_id: string;
	self_video: boolean;
	self_mute: boolean;
	self_deaf: boolean;
	request_to_speak_timestamp: null | string;
	mute: boolean;
	guild_id: string | null;
	deaf: boolean;
	channel_id: string | null;
	self_stream?: boolean;
}
