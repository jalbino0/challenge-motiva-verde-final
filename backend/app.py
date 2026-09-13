from datetime import date, timedelta
import os
import uuid

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Defina SUPABASE_URL e SUPABASE_KEY no arquivo backend/.env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


def api_error(message, status=500):
    return jsonify({"status": False, "message": message}), status


def normalize_km(value):
    if value in (None, ""):
        return None
    try:
        number = float(str(value).strip().replace(",", "."))
    except (TypeError, ValueError):
        return None
    if number < 0:
        return None
    return int(number) if number.is_integer() else number


def km_as_text(value):
    number = normalize_km(value)
    if number is None:
        return None
    return str(number).replace(".0", "") if isinstance(number, float) else str(number)


@app.get("/health")
def health():
    return jsonify({"status": True, "service": "motiva-verde-api"})


@app.post("/funcionarios/login")
def login_funcionario():
    try:
        payload = request.get_json(silent=True) or {}
        email = (payload.get("email") or "").strip()
        senha = payload.get("senha") or ""

        if not email or not senha:
            return api_error("Informe e-mail e senha.", 400)

        response = (
            supabase.table("Funcionarios")
            .select("id,email,senha,nome,sobrenome")
            .eq("email", email)
            .limit(1)
            .execute()
        )

        if not response.data:
            return api_error("Funcionário não encontrado.", 401)

        user = response.data[0]
        if senha != (user.get("senha") or ""):
            return api_error("Senha incorreta.", 401)

        funcionario = f"{user.get('nome') or ''} {user.get('sobrenome') or ''}".strip()
        return jsonify({
            "status": True,
            "funcionario": {
                "id": user.get("id"),
                "email": user.get("email") or email,
                "nome": user.get("nome") or "",
                "sobrenome": user.get("sobrenome") or "",
                "funcionario": funcionario or email,
            },
        })
    except Exception as exc:
        return api_error(f"Erro ao consultar funcionário: {exc}")


@app.get("/rodovias")
def listar_rodovias():
    try:
        response = supabase.table("Rodovias").select("*").order("kmInicial").execute()
        return jsonify(response.data or [])
    except Exception as exc:
        return api_error(f"Erro ao carregar rodovias: {exc}")


@app.get("/solicitacoes")
def listar_solicitacoes():
    try:
        response = supabase.table("Solicitacoes").select("*").order("dataSolicitacao", desc=True).execute()
        return jsonify(response.data or [])
    except Exception as exc:
        return api_error(f"Erro ao carregar solicitações: {exc}")


@app.post("/solicitacoes")
def criar_solicitacao():
    try:
        payload = request.get_json(silent=True) or {}
        nome_trecho = str(payload.get("nomeTrecho") or "").strip()
        tipo_operacao = str(payload.get("tipoVegetacao") or "").strip()
        km_inicial = normalize_km(payload.get("kmInicial"))
        km_final = normalize_km(payload.get("kmFinal"))

        if not nome_trecho:
            return api_error("Selecione uma rodovia.", 400)
        if not tipo_operacao:
            return api_error("Selecione o tipo de operação.", 400)
        if km_inicial is None or km_final is None:
            return api_error("Informe KM inicial e KM final válidos.", 400)
        if km_final < km_inicial:
            return api_error("O KM final precisa ser igual ou maior que o KM inicial.", 400)

        # O nome da rodovia sempre vem do cadastro real de Rodovias. Os KMs são
        # informados manualmente pelo operador, conforme o local exato da ocorrência.
        road_response = (
            supabase.table("Rodovias")
            .select("trecho,kmInicial,kmFinal")
            .eq("trecho", nome_trecho)
            .execute()
        )
        if not road_response.data:
            return api_error("Rodovia não encontrada no cadastro de Rodovias.", 400)

        canonical_name = str(road_response.data[0].get("trecho") or nome_trecho).strip()

        today = date.today()
        new_row = {
            "id": str(uuid.uuid4()),
            "nomeTrecho": canonical_name,
            "kmInicial": km_as_text(km_inicial),
            "kmFinal": km_as_text(km_final),
            # O schema existente usa tipoVegetacao; no app este campo representa
            # a operação solicitada (roçada, poda, manutenção de faixa etc.).
            "tipoVegetacao": tipo_operacao,
            "latitudeInicial": payload.get("latitudeInicial"),
            "latitudeFinal": payload.get("latitudeFinal"),
            "longitudeInicial": payload.get("longitudeInicial"),
            "longitudeFinal": payload.get("longitudeFinal"),
            "dataSolicitacao": today.isoformat(),
            "dataLimite": (today + timedelta(days=3)).isoformat(),
            "status": payload.get("status") or "Em andamento",
        }

        extended_row = {
            **new_row,
            "prioridade": payload.get("prioridade"),
            "descricao": payload.get("descricao"),
            "altura": payload.get("altura"),
            "fotoUri": payload.get("fotoUri"),
            "funcionario": payload.get("funcionario"),
        }

        try:
            response = supabase.table("Solicitacoes").insert(extended_row).execute()
        except Exception as extended_exc:
            message = str(extended_exc).lower()
            if "column" not in message and "schema cache" not in message:
                raise
            response = supabase.table("Solicitacoes").insert(new_row).execute()

        return jsonify({"status": "sucesso", "dados": response.data or [new_row]}), 201
    except Exception as exc:
        return api_error(f"Erro ao registrar solicitação: {exc}")


@app.post("/solicitacoes/<solicitacao_id>/concluir")
def concluir_solicitacao(solicitacao_id):
    try:
        payload = request.get_json(silent=True) or {}
        funcionario = (payload.get("funcionario") or "").strip()
        if not funcionario:
            return api_error("Funcionário responsável não informado.", 400)

        response = (
            supabase.table("Solicitacoes")
            .select("*")
            .eq("id", solicitacao_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return api_error("Solicitação não encontrada.", 404)

        solicitacao = response.data[0]

        def to_number(value):
            if value in (None, ""):
                return None
            try:
                return float(str(value).replace(",", "."))
            except ValueError:
                return None

        history_row = {
            "nomeTrecho": solicitacao.get("nomeTrecho"),
            "kmInicial": to_number(solicitacao.get("kmInicial")),
            "kmFinal": to_number(solicitacao.get("kmFinal")),
            "funcionario": funcionario,
            "dataCorte": date.today().isoformat(),
            "tipoVegetacao": solicitacao.get("tipoVegetacao"),
        }

        supabase.table("Historico").insert(history_row).execute()
        supabase.table("Solicitacoes").delete().eq("id", solicitacao_id).execute()

        return jsonify({"status": "sucesso"})
    except Exception as exc:
        return api_error(f"Erro ao concluir solicitação: {exc}")


@app.post("/historico")
def criar_historico():
    try:
        payload = request.get_json(silent=True) or {}
        required = ["nomeTrecho", "kmInicial", "kmFinal", "funcionario", "tipoVegetacao"]
        missing = [field for field in required if payload.get(field) in (None, "")]
        if missing:
            return api_error(f"Campos obrigatórios ausentes: {', '.join(missing)}", 400)

        # O app envia nome/KMs/tipo a partir de um registro existente de Rodovias.
        # O backend confirma essa combinação antes de gravar para impedir variações
        # de digitação e manter o Histórico padronizado.
        road_response = (
            supabase.table("Rodovias")
            .select("trecho,kmInicial,kmFinal,tipoVegetacao")
            .eq("trecho", str(payload.get("nomeTrecho")).strip())
            .eq("kmInicial", payload.get("kmInicial"))
            .eq("kmFinal", payload.get("kmFinal"))
            .limit(1)
            .execute()
        )

        if not road_response.data:
            return api_error("Trecho/KM não corresponde a um registro cadastrado em Rodovias.", 400)

        road = road_response.data[0]
        canonical_vegetation = (road.get("tipoVegetacao") or "").strip()
        requested_vegetation = str(payload.get("tipoVegetacao") or "").strip()
        if canonical_vegetation and requested_vegetation != canonical_vegetation:
            return api_error("Tipo de vegetação não corresponde ao cadastro da rodovia.", 400)

        new_row = {
            "nomeTrecho": (road.get("trecho") or "").strip(),
            "kmInicial": road.get("kmInicial"),
            "kmFinal": road.get("kmFinal"),
            "funcionario": str(payload.get("funcionario")).strip(),
            "dataCorte": date.today().isoformat(),
            "tipoVegetacao": canonical_vegetation or requested_vegetation,
        }

        response = supabase.table("Historico").insert(new_row).execute()
        return jsonify({"status": "sucesso", "dados": response.data or [new_row]}), 201
    except Exception as exc:
        return api_error(f"Erro ao registrar histórico: {exc}")


@app.get("/historico")
def listar_historico():
    try:
        response = supabase.table("Historico").select("*").order("dataCorte", desc=True).execute()
        return jsonify(response.data or [])
    except Exception as exc:
        return api_error(f"Erro ao carregar histórico: {exc}")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
