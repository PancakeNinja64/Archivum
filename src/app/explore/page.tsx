import { redirect } from 'next/navigation';
export default async function ExplorePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const query=await searchParams;
  const params=new URLSearchParams();
  for(const [key,value] of Object.entries(query)) {
    if(!value)continue;
    const name=key==='coverage'?'min':key;
    if(['q','platform','domain','min','sort','page','dataset','tab','modality','license','commercial'].includes(name)) {
      params.set(name,Array.isArray(value)?value.join(','):value);
    }
  }
  redirect(`/workspace/${params.size?`?${params}`:''}`);
}
