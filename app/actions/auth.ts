'use server';

import { SignupFormSchema, FormState } from '@/lib/definitions'
import { neon } from '@neondatabase/serverless';
import bcrypt from "bcryptjs";
import { createSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { deleteSession } from '@/lib/session'

export async function signup(state: FormState, formData: FormData) {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }


  const { name, password } = validatedFields.data
  const hashedPassword = await bcrypt.hash(password, 10)


  const sql = neon(process.env.DATABASE_URL!);

  const data = await sql`INSERT INTO users (username,password) VALUES (${name}, ${hashedPassword}) RETURNING username`;

  const user = data[0]
 
  if (!user) {
    return {
      message: 'An error occurred while creating your account.',
    }
  }

  await createSession(user.username)


  redirect('/')
}

export async function login(state: FormState, formData: FormData) {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }


  const { name, password } = validatedFields.data

  const sql = neon(process.env.DATABASE_URL!);

  const data = await sql`SELECT * FROM users WHERE username = ${name}`;
  const user = data[0]
  if (!user) {
    return {
      message: 'Invalid username or password.',
    }
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { message: 'Invalid username or password.' };
  }
  
 
  console.log('user', user)

  if (!user) {
    return {
      message: 'Invalid username or password.',
    }
  }

  await createSession(user.username)


  redirect('/')
}


 
export async function logout() {
  await deleteSession()
  redirect('/login')
}