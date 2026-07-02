// @ts-nocheck
import { redirect } from 'next/navigation'

// El acceso a distribuidores es DIRECTO al login (sin landing ni marketing).
// El enlace vive arriba a la derecha en la barra: "Distribuidores".
export default function DistribuidoresPage(){
  redirect('/distribuidores/login')
}
