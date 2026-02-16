import networkx as nx
import json
import os
from extraction import ExtractionResult

def build_graph(results: list[ExtractionResult]) -> nx.Graph:
    """Builds a NetworkX graph from a list of ExtractionResults."""
    G = nx.Graph()
    
    for res in results:
        for entity in res.entities:
            if not G.has_node(entity.name):
                G.add_node(entity.name, type=entity.type, description=entity.description, group=1) # group required for some viz
            else:
                # Update description if longer/better? Or merge?
                current_desc = G.nodes[entity.name].get("description", "")
                if len(entity.description) > len(current_desc):
                    G.nodes[entity.name]["description"] = entity.description

        for rel in res.relationships:
            if G.has_edge(rel.source, rel.target):
                # Increment weight or update list of types
                G[rel.source][rel.target]['weight'] = G[rel.source][rel.target].get('weight', 0) + 1
            else:
                G.add_edge(rel.source, rel.target, type=rel.type, description=rel.description, weight=1)
                
    return G

def export_graph_to_json(G: nx.Graph, output_path: str):
    """Exports NetworkX graph to JSON format compatible with react-force-graph-3d."""
    data = nx.node_link_data(G)
    # Ensure links use 'source' and 'target' as IDs (networkx default usually does)
    # React-force-graph expects { nodes: [], links: [] }
    # nx.node_link_data returns { directed: ..., multigraph: ..., graph: ..., nodes: ..., links: ... }
    # In some versions, it might be 'edges' instead of 'links'?
    
    cleaned_data = {
        "nodes": data.get('nodes', []),
        "links": data.get('links', data.get('edges', []))
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=2)

def save_metadata(book_id: str, title: str, graph_path: str):
    """Saves metadata about the analyzed book."""
    meta_path = "../data/metadata.json"
    metadata = {}
    if os.path.exists(meta_path):
        with open(meta_path, 'r') as f:
            metadata = json.load(f)
            
    metadata[book_id] = {
        "id": book_id,
        "title": title,
        "graph_file": graph_path,
        "timestamp": os.path.getmtime(graph_path) if os.path.exists(graph_path) else 0
    }
    
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
