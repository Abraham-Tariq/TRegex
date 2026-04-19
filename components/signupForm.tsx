'use client'

import { signup } from '@/app/actions/auth'
import { useActionState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <form action={action} className="flex flex-col gap-3">
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">username</p>
        <Input id="name" name="name" placeholder="username" autoComplete="off" spellCheck={false} className="font-mono text-sm" />
        {state?.errors?.name && (
          <p className="text-xs text-red-400 mt-1.5">{state.errors.name}</p>
        )}
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1.5">password</p>
        <Input id="password" name="password" type="password" className="font-mono text-sm" />
        {state?.errors?.password && (
          <div className="text-xs text-red-400 mt-1.5">
            <p>password must:</p>
            <ul className="mt-0.5 flex flex-col gap-0.5">
              {state.errors.password.map((error) => (
                <li key={error}>— {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Button variant="secondary" disabled={pending} type="submit" className="w-full font-mono text-sm mt-1">
        sign up
      </Button>
    </form>
  )
}