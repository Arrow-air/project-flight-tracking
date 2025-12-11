
--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
    ('00000000-0000-0000-0000-000000000000', '770e8400-e29b-41d4-a716-446655440002', 'authenticated', 'authenticated', 'jane.operator@acme.com', crypt('admin1', gen_salt('bf')), '2023-04-22 13:10:31.463703+00', NULL, '', NULL, '', '2023-04-22 13:10:03.275387+00', '', '', NULL, '2023-04-22 13:10:31.458239+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "Jane Operator"}', NULL, '2022-10-04 03:41:27.391146+00', '2023-04-22 13:10:31.463703+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
    ('00000000-0000-0000-0000-000000000000', '770e8400-e29b-41d4-a716-446655440003', 'authenticated', 'authenticated', 'bob.admin@greenvalley.com', crypt('admin1', gen_salt('bf')), '2023-04-22 13:10:31.463703+00', NULL, '', NULL, '', '2023-04-22 13:10:03.275387+00', '', '', NULL, '2023-04-22 13:10:31.458239+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "Bob Admin"}', NULL, '2022-10-04 03:41:27.391146+00', '2023-04-22 13:10:31.463703+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
    ('00000000-0000-0000-0000-000000000000', '770e8400-e29b-41d4-a716-446655440001', 'authenticated', 'authenticated', 'a@e.com', crypt('admin1', gen_salt('bf')), '2023-04-22 13:10:31.463703+00', NULL, '', NULL, '', '2023-04-22 13:10:03.275387+00', '', '', NULL, '2025-08-06 18:10:25.487301+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "John Supervisor"}', NULL, '2022-10-04 03:41:27.391146+00', '2025-09-27 22:27:50.835785+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '{"sub": "770e8400-e29b-41d4-a716-446655440001", "email": "john.supervisor@acme.com"}', 'email', '2023-04-22 13:10:31.458239+00', '2022-10-04 03:41:27.391146+00', '2023-04-22 13:10:31.463703+00', '770e8400-e29b-41d4-a716-446655440001'),
    ('770e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '{"sub": "770e8400-e29b-41d4-a716-446655440002", "email": "jane.operator@acme.com"}', 'email', '2023-04-22 13:10:31.458239+00', '2022-10-04 03:41:27.391146+00', '2023-04-22 13:10:31.463703+00', '770e8400-e29b-41d4-a716-446655440002'),
    ('770e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '{"sub": "770e8400-e29b-41d4-a716-446655440003", "email": "bob.admin@greenvalley.com"}', 'email', '2023-04-22 13:10:31.458239+00', '2022-10-04 03:41:27.391146+00', '2023-04-22 13:10:31.463703+00', '770e8400-e29b-41d4-a716-446655440003');


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
    ('71b69167-6ade-4c34-9632-5a967b4e4063', '770e8400-e29b-41d4-a716-446655440001', '2025-07-22 16:21:16.498589+00', '2025-08-06 18:07:19.168525+00', NULL, 'aal1', NULL, '2025-08-06 18:07:19.1685', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:141.0) Gecko/20100101 Firefox/141.0', '192.168.65.1', NULL),
    ('851888f8-d400-4528-9799-b6622847a160', '770e8400-e29b-41d4-a716-446655440001', '2025-08-06 18:10:24.021657+00', '2025-08-06 18:10:24.021657+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:141.0) Gecko/20100101 Firefox/141.0', '192.168.65.1', NULL),
    ('8ec1af86-0981-45a0-a54f-5aa88ed8102a', '770e8400-e29b-41d4-a716-446655440001', '2025-08-06 18:10:25.487372+00', '2025-09-27 22:27:50.836454+00', NULL, 'aal1', NULL, '2025-09-27 22:27:50.836421', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:143.0) Gecko/20100101 Firefox/143.0', '192.168.65.1', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
    ('71b69167-6ade-4c34-9632-5a967b4e4063', '2025-07-22 16:21:16.502896+00', '2025-07-22 16:21:16.502896+00', 'password', 'e51dd060-9818-46a6-a80e-430363608d40'),
    ('851888f8-d400-4528-9799-b6622847a160', '2025-08-06 18:10:24.023537+00', '2025-08-06 18:10:24.023537+00', 'password', '3b640c27-104a-46ae-8326-973fb13e7c6a'),
    ('8ec1af86-0981-45a0-a54f-5aa88ed8102a', '2025-08-06 18:10:25.488919+00', '2025-08-06 18:10:25.488919+00', 'password', '4300a081-3eee-416b-9c22-e2fbce3d6206');


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--
-- INSERT INTO "public"."organizations" ("id", "name", "description", "email", "date_created", "date_updated") VALUES
-- 	('550e8400-e29b-41d4-a716-446655440001', 'Acme Land Management', 'Professional land clearing and management services', 'atilla.istami@gmail.com', '2025-07-22 16:20:35.709377+00', '2025-07-22 16:20:35.709377+00'),
-- 	('550e8400-e29b-41d4-a716-446655440002', 'Green Valley Properties', 'Sustainable property development and maintenance', 'kjcerveny@gmail.com', '2025-07-22 16:20:35.709377+00', '2025-07-22 16:20:35.709377+00');


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--
-- We can skip due to trigger on_auth_user_created
