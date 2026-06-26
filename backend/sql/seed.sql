insert into users (id, name, email, address, password_hash, role)
values
  ('11111111-1111-1111-1111-111111111111', 'Cecilia Alexandra Bennett', 'admin@storegrid.com', '12 Market Street, New Delhi', crypt('Admin@1234', gen_salt('bf')), 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'Jonathan Miles Fernandez', 'owner@storegrid.com', '48 Riverfront Avenue, Bengaluru', crypt('Owner@1234', gen_salt('bf')), 'store_owner'),
  ('33333333-3333-3333-3333-333333333333', 'Aarav Prakash Menon', 'user@storegrid.com', '90 Lake View Road, Pune', crypt('User@1234', gen_salt('bf')), 'normal_user')
on conflict do nothing;

insert into stores (id, name, email, address, owner_id)
values
  ('44444444-4444-4444-4444-444444444444', 'Urban Tonic Cafe', 'hello@urbantonic.com', '118 MG Road, Bengaluru', '22222222-2222-2222-2222-222222222222'),
  ('55555555-5555-5555-5555-555555555555', 'Northwind Groceries', 'care@northwindgrocers.com', '22 Park Lane, Mumbai', null),
  ('66666666-6666-6666-6666-666666666666', 'Metro Books and More', 'support@metrobooks.com', '77 Connaught Place, Delhi', null)
on conflict do nothing;

update users set store_id = '44444444-4444-4444-4444-444444444444' where id = '22222222-2222-2222-2222-222222222222';

insert into ratings (user_id, store_id, rating)
values
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 5),
  ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 3)
on conflict do nothing;
