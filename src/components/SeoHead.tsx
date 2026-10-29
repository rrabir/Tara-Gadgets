import React, { useEffect } from 'react';
import { Product, StoreSettings } from '../types/index.ts';

interface SeoHeadProps {
  product?: Product | null;
  settings: StoreSettings;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ product, settings }) => {
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    // Helper to safely set or create a meta tag
    const setMetaTag = (attribute: 'name' | 'property', attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attribute}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper to safely set or create link tags (e.g. canonical)
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Helper to safely set or create JSON-LD script
    const setJsonLd = (id: string, jsonContent: object) => {
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonContent, null, 2);
    };

    if (product) {
      // PRODUCT-SPECIFIC SEO
      const price = product.salePrice || product.regularPrice;
      const title = `${product.name} | ${product.brand} - ${settings.storeName} BD`;
      const description = product.description
        ? product.description.slice(0, 155).replace(/\s+/g, ' ').trim()
        : `Buy genuine ${product.name} with official warranty at ${settings.storeName} BD. Cash on Delivery across Bangladesh.`;
      
      const imageUrl = product.coverImage?.startsWith('http')
        ? product.coverImage
        : `${origin}${product.coverImage || '/src/assets/images/gadget_anc_earbuds_1793251027311.jpg'}`;

      const canonicalUrl = `${origin}?product=${product.slug}`;

      // Update Browser Title
      document.title = title;

      // Standard Meta Tags
      setMetaTag('name', 'description', description);

      // OpenGraph Tags
      setMetaTag('property', 'og:title', title);
      setMetaTag('property', 'og:description', description);
      setMetaTag('property', 'og:image', imageUrl);
      setMetaTag('property', 'og:type', 'product');
      setMetaTag('property', 'og:url', canonicalUrl);
      setMetaTag('property', 'og:site_name', `${settings.storeName} BD`);
      setMetaTag('property', 'product:price:amount', price.toString());
      setMetaTag('property', 'product:price:currency', 'BDT');
      setMetaTag('property', 'product:availability', product.stock > 0 ? 'instock' : 'outofstock');

      // Twitter Cards
      setMetaTag('name', 'twitter:card', 'summary_large_image');
      setMetaTag('name', 'twitter:title', title);
      setMetaTag('name', 'twitter:description', description);
      setMetaTag('name', 'twitter:image', imageUrl);

      // Canonical link
      setLinkTag('canonical', canonicalUrl);

      // Schema.org Product Structured Data (JSON-LD)
      const schemaData = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: [imageUrl],
        description: product.description || description,
        sku: product.sku,
        brand: {
          '@type': 'Brand',
          name: product.brand
        },
        category: product.category,
        offers: {
          '@type': 'Offer',
          url: canonicalUrl,
          priceCurrency: 'BDT',
          price: price,
          priceValidUntil: '2027-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: `${settings.storeName} BD`
          }
        }
      };

      setJsonLd('tara-gadgets-jsonld', schemaData);

    } else {
      // DEFAULT STOREFRONT SEO
      const defaultTitle = `${settings.storeName} BD - Premium Tech & Gadget Store`;
      const defaultDesc = `Official online gadget store for ${settings.storeName} BD. Explore genuine smartwatches, ANC earbuds, fast chargers, and accessories with Cash on Delivery across Bangladesh.`;
      const defaultImage = `${origin}/src/assets/images/gadget_anc_earbuds_1793251027311.jpg`;
      const defaultUrl = origin;

      document.title = defaultTitle;

      setMetaTag('name', 'description', defaultDesc);
      setMetaTag('property', 'og:title', defaultTitle);
      setMetaTag('property', 'og:description', defaultDesc);
      setMetaTag('property', 'og:image', defaultImage);
      setMetaTag('property', 'og:type', 'website');
      setMetaTag('property', 'og:url', defaultUrl);
      setMetaTag('property', 'og:site_name', `${settings.storeName} BD`);

      setMetaTag('name', 'twitter:card', 'summary_large_image');
      setMetaTag('name', 'twitter:title', defaultTitle);
      setMetaTag('name', 'twitter:description', defaultDesc);
      setMetaTag('name', 'twitter:image', defaultImage);

      setLinkTag('canonical', defaultUrl);

      // Store / Organization Schema
      const storeSchema = {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: `${settings.storeName} BD`,
        description: defaultDesc,
        url: defaultUrl,
        currenciesAccepted: 'BDT',
        paymentAccepted: 'Cash on Delivery',
        priceRange: '৳৳',
        email: settings.email,
        sameAs: [settings.facebookUrl]
      };

      setJsonLd('tara-gadgets-jsonld', storeSchema);
    }
  }, [product, settings]);

  return null;
};
