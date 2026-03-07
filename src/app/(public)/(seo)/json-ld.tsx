interface JsonLdProps {
  data: object;
}

export default function JsonLd({ data }: JsonLdProps) {
  const scriptProps = {
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  };
  return <script type="application/ld+json" {...scriptProps} />;
}
