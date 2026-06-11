// Columnas mínimas que necesita components/ProductCard.tsx para pintar la
// tarjeta de producto en grids. Evita arrastrar descripciones completas
// (description, images, etc.) en los listados.
// Nota: las páginas que muestran la categoría deben añadir ', categories(name)'.
export const CARD_COLUMNS = 'id,name,brand,price_incl_tax,sale_price,on_sale,image_url,stock,has_variants,category_id,is_new'
