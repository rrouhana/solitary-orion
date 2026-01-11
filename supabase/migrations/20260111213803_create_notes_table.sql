-- Create notes table
create table if not exists notes (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null
);

-- Enable Row Level Security
alter table notes enable row level security;

-- Create policy for public access (for demo purposes)
create policy "Allow public access" on notes for all using (true);
