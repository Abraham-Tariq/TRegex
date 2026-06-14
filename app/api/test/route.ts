import { NextResponse } from 'next/server';

export async function GET() {
  const regex = /(x+x+)+y/;
  const str = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";


  const result = regex.test(str);

  return NextResponse.json({
    message: "Regex execution complete",
    result: result,
  });
}