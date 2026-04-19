'use client'

import { login } from '@/app/actions/auth'
import { useActionState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function LoginForm() {
    const [state, action, pending] = useActionState(login, undefined)

    return (
        <form action={action} className="flex flex-col gap-3">
            <div>
                <p className="text-xs text-muted-foreground mb-1.5">username</p>
                <Input id="name" name="name" placeholder="username" autoComplete="off" spellCheck={false} className="font-mono text-sm" />
            </div>

            <div>
                <p className="text-xs text-muted-foreground mb-1.5">password</p>
                <Input id="password" name="password" type="password" className="font-mono text-sm" />
            </div>

            {state?.message && (
                <p className="text-xs text-red-400">{state.message}</p>
            )}
        

            <Button variant="secondary" disabled={pending} type="submit" className="w-full font-mono text-sm mt-1">
                log in
            </Button>
        </form>
    )
}